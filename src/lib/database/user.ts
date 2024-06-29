import {createLibrary} from "./library";
import {prismaClient} from "./prisma";
import {createProfile, deleteProfile} from "./profile";

export type GetAllUsers = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export type CreateUser = {
  name: string;
  email: string;
  password: string;
};

export type UpdateUser = {
  id?: number;
  name: string;
  email: string;
  password: string;
};

export async function getAllUsers() {
  return await prismaClient.user.findMany();
}

export async function getUserByEmail(email: string) {
  return await prismaClient.user.findUnique({
    where: {
      email,
    },
    include: {
      profile: true, //also fetch "Profile"
      library: true,
    },
  });
}

export async function getUserById(userId: number) {
  return await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true, //also fetch "Profile"
      rate: true, //fetch "rate"
    },
  });
}

export async function createUser(
  email: string,
  userName: string,
  password: string,
) {
  try {
    const profile = await createProfile();
    const library = await createLibrary();
    const profileId = profile?.id;
    const libraryId = library?.id;

    if (profileId !== undefined && libraryId !== undefined) {
      const data = {
        email,
        userName,
        password,
        profileId,
        libraryId,
      };

      const user = await prismaClient.user.create({
        data: {
          email: data.email,
          userName: data.userName,
          password: data.password,
          profileId: data.profileId,
          libraryId: data.libraryId,
        },
      });
      return user;
    } else {
      console.log("Failed to create user");
    }
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

export async function updateUser(userId: number, request: any) {
  return await prismaClient.user.update({
    where: {
      id: userId,
    },
    data: request.body,
  });
}

export async function updatePassword(email: string, newPassword: string) {
  return await prismaClient.user.update({
    where: {
      email,
    },
    data: {
      password: newPassword,
    },
  });
}

export async function deleteUser(id: number, request: any) {
  const profileId = request.params.profileId;
  await deleteProfile(profileId); // Ensure to await the deletion of profile
  return await prismaClient.user.delete({
    where: {
      id,
    },
  });
}
