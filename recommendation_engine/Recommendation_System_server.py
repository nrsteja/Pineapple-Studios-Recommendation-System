import random

from quart import Quart, jsonify, request
from quart_cors import cors
from Recommendation_System import (combined_recommendations,
                                   generate_LLM_recommendation,
                                   get_all_recommendations,
                                   load_data_structures)

app = Quart(__name__)
cors(app)

data_structures = load_data_structures()

@app.route('/recommend/llm', methods=['POST'])
async def recommend_llm():
    try:
        request_data = await request.get_json()
        media_name = request_data['media_name']
        books, movies, songs = await generate_LLM_recommendation(media_name)
        response = {
            'books': books,
            'movies': movies,
            'songs': songs
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommend/content', methods=['POST'])
async def recommend_content():
    try:
        request_data = await request.get_json()
        # print('REQUEST SUCCESSFUL')
        media_name = request_data['media_name']
        # print("PRINTING MEDIA NAME..... (request sucessful)")
        # print(media_name)
        books, movies, songs = await get_all_recommendations(media_name)
        # print('GOT RESPONSE')
        response = {
            'books': books,
            'movies': movies,
            'songs': songs
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommend/combined', methods=['POST'])
async def recommend_combined():
    try:
        request_data = await request.get_json()
        media_name = request_data['media_name']
        combined_books, combined_movies, combined_songs = await combined_recommendations(media_name)
        response = {
            'books': combined_books,
            'movies': combined_movies,
            'songs': combined_songs
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
