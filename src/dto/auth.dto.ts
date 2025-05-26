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
  email: string | null;
}

export { IAuthUserBody, ICheckUsernameBody, IProfile };
