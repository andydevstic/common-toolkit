import { faker } from "@faker-js/faker";

import { stringUtils } from ".";

interface UserConfig {
  rootRefCode?: string;
  password: string;
}

interface User {
  parentRefCode: string;
  refCode: string;
  password: string;
  email: string;
  children: User[];
}

interface NormalizedUser {
  parentRefCode: string;
  refCode: string;
  password: string;
  email: string;
}

interface ReferralTreeConfig {
  noOfLevels: number;
  minChildPerNode: number;
  maxChildPerNode: number;
  mustHaveChildPerNode: number;
  userConfig: UserConfig;
  passwordHasher?: (password: string) => Promise<string>;
  refCodeGenerator?: () => string;
  addAdditionalData?: () => Promise<Record<string, any>>;
}

const defaultRefcodeGenerator = () =>
  stringUtils.generateRandomId().slice(10).toUpperCase();

export const generateReferralTree = async (data: ReferralTreeConfig) => {
  const {
    maxChildPerNode,
    minChildPerNode,
    mustHaveChildPerNode,
    noOfLevels,
    userConfig,
    passwordHasher,
    refCodeGenerator,
    addAdditionalData = () => {},
  } = data;

  const hashedPassword = await passwordHasher(userConfig.password);

  const rootUser = await genNewUser(null, {
    hashedPassword,
    additionalDataGenerator: addAdditionalData,
    refCodeGenerator: refCodeGenerator || defaultRefcodeGenerator,
  });

  const totalUsersToInsert: NormalizedUser[] = [normalizeUser(rootUser)];

  let currentLayerUsers: User[] = [rootUser];
  let totalUsersCount = currentLayerUsers.length;

  for (let currentLevel = 0; currentLevel < noOfLevels; currentLevel++) {
    const allChildUserCreated: User[] = [];

    // Handle the node where the number of children is required
    const nodeSelectedAsRequired = currentLayerUsers[0];
    for (let i = 0; i < mustHaveChildPerNode; i++) {
      const newUser = await genNewUser(nodeSelectedAsRequired.refCode, {
        hashedPassword,
        refCodeGenerator: refCodeGenerator || defaultRefcodeGenerator,
        additionalDataGenerator: addAdditionalData,
      });

      allChildUserCreated.push(newUser);
      nodeSelectedAsRequired.children.push(newUser);
    }

    // Handle the nodes where the number of children is within range.
    // Exclude the first user as it's already processed
    await Promise.all(
      currentLayerUsers.slice(1, currentLayerUsers.length).map(async (user) => {
        const noOfChildNodes = faker.helpers.rangeToNumber({
          min: minChildPerNode,
          max: maxChildPerNode,
        });

        for (let i = 0; i < noOfChildNodes; i++) {
          const newUser = await genNewUser(user.refCode, {
            hashedPassword,
            refCodeGenerator: refCodeGenerator || defaultRefcodeGenerator,
            additionalDataGenerator: addAdditionalData,
          });

          allChildUserCreated.push(newUser);
          user.children.push(newUser);
        }
      })
    );

    // Move on to next layer
    const normalizedUsers: Omit<User, "children">[] =
      allChildUserCreated.map(normalizeUser);

    totalUsersToInsert.push(...normalizedUsers);
    currentLayerUsers = allChildUserCreated;
    totalUsersCount += currentLayerUsers.length;
  }

  return { rootUser, totalUsersCount, totalUsersToInsert };
};

const normalizeUser = (user: User) => {
  const cloned = JSON.parse(JSON.stringify(user));
  delete cloned.children;

  return cloned;
};

const genNewUser = async (
  parentRefCode: string,
  { hashedPassword, refCodeGenerator, additionalDataGenerator }
): Promise<User> => {
  const additionalData = await additionalDataGenerator();

  return {
    parentRefCode,
    password: hashedPassword,
    email: faker.internet.email().toLowerCase(),
    children: [],
    refCode: refCodeGenerator(),
    ...additionalData,
  };
};

// generateReferralTree({
//   maxChildPerNode: 2,
//   minChildPerNode: 1,
//   mustHaveChildPerNode: 5,
//   noOfLevels: 5,
//   passwordHasher: async (data) => data,
//   addAdditionalData: async () => {
//     return {
//       fullName: faker.person.fullName(),
//     };
//   },
//   userConfig: {
//     password: "12345",
//     rootRefCode: "ABCD1234",
//   },
// })
//   .then((data) => {
//     console.log(data.totalUsersCount);
//     fs.writeFileSync(
//       path.resolve(__dirname, "referral_tree.json"),
//       Buffer.from(JSON.stringify(data.rootUser))
//     );

//     fs.writeFileSync(
//       path.resolve(__dirname, "referral_users.json"),
//       Buffer.from(JSON.stringify(data.totalUsersToInsert))
//     );
//   })
//   .catch((e) => console.error(e));
