interface IAuthUserBody {
  name: string;
  username: string;
  password: string;
}
interface ICheckUsernameBody {
  username: string;
}
interface IProfile {
  name: string;
  id: number;
}

export { IAuthUserBody, ICheckUsernameBody, IProfile };
