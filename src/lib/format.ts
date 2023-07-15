export const uppercaseFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const formatFullName = (user: { firstName: string; lastName: string }) =>
  `${uppercaseFirstLetter(user.firstName)} ${uppercaseFirstLetter(
    user.lastName
  )}`;
