import {prismaClient} from "./prisma";

export const createUserClickedData = async (request: any) => {
  try {
    const clickedData = request.body;
    const assignment = await prismaClient.userClickedData.create({
      data: clickedData,
    });
    return assignment;
  } catch (e) {
    console.log(e);
  }
};

export const getUserClickedDataByItemId = async (itemIdArg: any) => {
  try {
    const assignment = await prismaClient.userClickedData.findUnique({
      where: {
        itemId: itemIdArg,
      },
    });
    return assignment;
  } catch (e) {
    console.log(e);
  }
};

export const updateNumberOfClicked = async (itemIdArg: any, userIdArg: any) => {
  let assigment = await getUserClickedDataByItemId(itemIdArg);
  if (!assigment) {
    const data = {
      body: {
        userId: userIdArg,
        itemId: itemIdArg,
      },
    };
    assigment = await createUserClickedData(data);
  }
  let newNumberOfClicked = 0;

  if (assigment?.numberOfClicked)
    newNumberOfClicked = assigment?.numberOfClicked + 1;

  try {
    const userClickedData = await prismaClient.userClickedData.update({
      where: {
        itemId: assigment?.itemId,
      },
      data: {
        numberOfClicked: newNumberOfClicked,
      },
    });
    return userClickedData;
  } catch (e) {
    console.log(e);
  }
};
