#!/usr/bin/env python
# coding: utf-8
import asyncio
import cProfile
import os
import random
import re

import async_lru
import joblib
import numpy as np
import pandas as pd
from async_lru import alru_cache
from dotenv import load_dotenv
from fuzzywuzzy import fuzz, process
from joblib import Memory
from openai import AsyncOpenAI, OpenAI
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from sklearn.neighbors import NearestNeighbors


pr = cProfile.Profile()
pr.enable()

# Load data
movies = pd.read_csv('Datasets_for_content_recommendation/movies.csv', low_memory=False)
songs = pd.read_csv('Datasets_for_content_recommendation/spotify_millsongdata.csv')
books = pd.read_csv('Datasets_for_content_recommendation/GoogleBookAPIDataset.csv')

# Drop unnecessary columns
books_df = books.drop(columns=['id', 'averageRating', 'maturityRating', 'pageCount', 'Unnamed: 0.1', 'Unnamed: 0'])
movies_df = movies.drop(columns=['id', 'rating', 'certificate', 'duration', 'votes', 'gross_income', 'directors_id', 'year'])
songs_df = songs.drop(columns=['link'])

# Text preprocessing function
def preprocess_text(text_series):
    return text_series.str.lower().replace(r'[^\w\s]|_\d+', '', regex=True)

# Apply preprocessing
movies_df['name'] = preprocess_text(movies_df['name'])
movies_df['genre'] = preprocess_text(movies_df['genre'])
movies_df['directors_name'] = preprocess_text(movies_df['directors_name'])
movies_df['stars_name'] = preprocess_text(movies_df['stars_name'])
movies_df['description'] = preprocess_text(movies_df['description'])
books_df['title'] = preprocess_text(books_df['title'])
books_df['desc'] = preprocess_text(books_df['desc'])
books_df['authors'] = preprocess_text(books_df['authors'])
books_df['categories'] = preprocess_text(books_df['categories'])
books_df['publishedDate'] = preprocess_text(books_df['publishedDate'])
songs_df['song'] = preprocess_text(songs_df['song'])
songs_df['artist'] = preprocess_text(songs_df['artist'])
songs_df['text'] = preprocess_text(songs_df['text'])


# Initialize joblib Memory to cache results
mem = Memory(location='./joblib_cache', verbose=10)

# Define function to load precomputed data structures
def load_data_structures():
    structures = ['tfidf_vectorizer_books', 'tfidf_matrix_books', 'cosine_sim_books', 'book_indices',
                  'tfidf_vectorizer_songs', 'tfidf_matrix_songs', 'model_nn_songs', 'song_indices',
                  'tfidf_vectorizer_movies', 'tfidf_matrix_movies', 'model_nn_movies', 'movie_indices']
    return {s: joblib.load(f'{s}.joblib') for s in structures}

data_structures = load_data_structures()

# Define function to get cached best match
@mem.cache
def get_cached_best_match(title, choice_keys):
    return process.extractOne(title, choice_keys, scorer=fuzz.WRatio)

# Define function to get recommendations
def get_recommendations(model_nn, media_title, data_frame, indices, column_name, vectorizer, tfidf_matrix=None, is_book=False):
    # title = media_title.lower().strip()
    # choice_keys = indices.index.tolist()
    # print("ENTERED getRecommendation")
    title = media_title.lower().strip()
    choice_keys = indices.index.tolist()
    
    # print("Type of choice_keys:", type(choice_keys))  # Debugging line
    # print("Contents of choice_keys:", choice_keys[:5])  # Print first 5 to check


    # Transform the new input using the saved TF-IDF vectorizer
    @mem.cache
    def get_tfidf_input(media_title, vectorizer):
        return vectorizer.transform([media_title])

    # print("Calling get_tfidf_input with:", media_title, "[Type:", type(media_title), "]")
    tfidf_input = get_tfidf_input(media_title, vectorizer)

    @mem.cache
    def get_nn_results(tfidf_input, model_nn):
        return model_nn.kneighbors(tfidf_input, n_neighbors=20)



    # If the title exists exactly, use it; otherwise, use fuzzy matching.
    if title in choice_keys:
        idx = indices[title]
    else:
        # print("Calling get_cached_best_match with:", title, "[Type:", type(title), "] and choice_keys")
        closest_match, _ = get_cached_best_match(title, choice_keys)
        idx = indices.get(closest_match, None)

    if idx is None:
        # print(f"No close match found for '{media_title}'.")
        return []

    if isinstance(idx, (pd.Series, np.ndarray)):
        idx = idx.iloc[0]

    # Deduplicate and fetch recommendations
    seen = set()
    recommendations = []
    if is_book:
        sim_scores = linear_kernel(tfidf_input, tfidf_matrix).flatten()
        top_indices = sim_scores.argsort()[::-1]
        for i in top_indices:
            if len(recommendations) >= 2:
                break
            # print("HELLO DATAFRAME")
            rec = data_frame.iloc[i][column_name]
            # print("Type of rec before adding to set:", type(rec))  # This will clarify what type is being added.
            if rec not in seen:
                seen.add(rec)
                recommendations.append(rec)
    else:
        # print("Calling get_nn_results with tfidf_input shape:", tfidf_input.shape)
        distances, nn_indices = get_nn_results(tfidf_input, model_nn)
        for i in nn_indices.flatten()[1:]:
            if len(recommendations) >= 2:
                break
            rec = data_frame.iloc[i][column_name]
            if rec not in seen:
                seen.add(rec)
                recommendations.append(rec)

    return recommendations
@alru_cache(maxsize=None)
async def get_all_recommendations(media_title):
    try:
        book_recommendations = get_recommendations(None, media_title, books_df, data_structures['book_indices'], "title", data_structures['tfidf_vectorizer_books'], tfidf_matrix=data_structures['tfidf_matrix_books'], is_book=True)
     
        song_recommendations = get_recommendations(data_structures['model_nn_songs'], media_title, songs_df, data_structures['song_indices'], "song", data_structures['tfidf_vectorizer_songs'])

        movie_recommendations = get_recommendations(data_structures['model_nn_movies'], media_title, movies_df, data_structures['movie_indices'], "name", data_structures['tfidf_vectorizer_movies'])

        return book_recommendations, song_recommendations, movie_recommendations
    except Exception as e:
        print(f"Error in get_all_recommendations: {e}")
        raise e
# Compile the regular expressions once
cleaning_patterns = [
    re.compile(r'^\d+\.\s*'),  # Leading numbers like "1. "
    re.compile(r'"'),  # Double quotes
    re.compile(r'\s-\s.*'),  # Text after " - "
    re.compile(r'\sby\s.*'),  # Text after " by "
    re.compile(r'\sfrom\s.*'),  # Text after " from "
    re.compile(r'\(.*?\)'),  # Text in parentheses
    re.compile(r'\s?directed.*'),  # Text after " directed", even if it starts at the beginning
    re.compile(r'\s?starring.*'),  # Text after " starring"
    # Add more patterns here if there are other similar patterns to clean
]

# Define function to generate LLM recommendation
 
# Define the clean_item function outside so it's not redefined every call
def clean_item(item, cleaning_patterns):
    for pattern in cleaning_patterns:
        item = pattern.sub('', item)
    return item.strip()

@alru_cache(maxsize=None)
async def generate_LLM_recommendation(media_name):
    load_dotenv()
    client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    prompt = f"recommend me books, movies and songs similar to '{media_name}'"
    
    # Asynchronous call to OpenAI API
    response = await client.chat.completions.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}])
    
    content = response.choices[0].message.content.strip()
    
    sections = content.split('\n\n')
    recommendations = {
        section.split('\n')[0].replace(':', '').strip(): [clean_item(item, cleaning_patterns) for item in section.split('\n')[1:]]
        for section in sections
    }
    
    return recommendations.get('Books', []), recommendations.get('Movies', []), recommendations.get('Songs', [])



# Define function to combine recommendations
# @mem.cache
@alru_cache(maxsize=None)
async def combined_recommendations(media_title):
    # Fetch LLM recommendations
    llm_books, llm_movies, llm_songs = await generate_LLM_recommendation(media_title)
    print("LLM BOOKS:")
    print(llm_books)
    # Fetch content-based recommendations
    content_books, content_songs, content_movies = await get_all_recommendations(media_title)

    # Function to pick one recommendation from each source, if available
    def pick_one_from_each(llm_list, content_list):
        combined = []
        # Pick the first available from the LLM list
        for item in llm_list:
            if item:  # Ensure the item is not empty
                combined.append(item)
                break
        # Pick the first available from the content list that is not already in combined
        for item in content_list:
            if item and item not in combined:  # Ensure the item is not empty and not a duplicate
                combined.append(item)
                break
        return combined

    # Pick one from each list for books, movies, and songs
    combined_books = pick_one_from_each(llm_books, content_books)
    combined_movies = pick_one_from_each(llm_movies, content_movies)
    combined_songs = pick_one_from_each(llm_songs, content_songs)

    return combined_books, combined_movies, combined_songs

pr.disable()
pr.print_stats(sort='time')
