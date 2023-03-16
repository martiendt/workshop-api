import { IDatabaseAdapter } from "@src/database/connection";

export const name = "users";

export const restrictedFields = ["password"];

const isExists = async (db: IDatabaseAdapter) => {
  const collections = (await db.listCollections()) as [];
  return collections.some(function (el: any) {
    return el.name === name;
  });
};

export async function createCollection(db: IDatabaseAdapter) {
  try {
    if (!(await isExists(db))) {
      await db.createCollection(name);
    }

    await db.updateSchema(name, {
      bsonType: "object",
      required: ["email"],
      properties: {
        username: {
          bsonType: "string",
          description: "must be a string",
        },
        email: {
          bsonType: "string",
          description: "must be a string",
        },
        password: {
          bsonType: "string",
          description: "must be a string",
        },
      },
    });
    await db.createIndex(
      name,
      { email: -1 },
      {
        unique: true,
        collation: {
          locale: "en",
          strength: 2,
        },
      }
    );
    await db.listCollections();
  } catch (error) {
    throw error;
  }
}

export async function dropCollection(db: IDatabaseAdapter) {
  try {
    if (await isExists(db)) {
      await db.dropCollection(name);
    }
  } catch (error) {
    throw error;
  }
}
