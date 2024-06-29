import {
  createTagsInItemsAssignment,
  getTaginItemAssignment,
} from "./TagsInItems";
import {createTag, getTagByName} from "./tag";

export const createTagsforItem = async (itemId: number, tagName: string) => {
  //create Tag
  let tag = await getTagByName(tagName);
  if (!tag) {
    tag = await createTag(tagName);
  }

  //create Assignment
  const assignmentData = {
    body: {
      tagId: tag?.id,
      itemId: itemId,
    },
  };
  let assignment = await getTaginItemAssignment(assignmentData);
  if (!assignment)
    assignment = await createTagsInItemsAssignment(assignmentData);

  return tag;
};
