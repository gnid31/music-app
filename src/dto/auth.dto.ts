interface IAuthUserBody {
  name?: string;
  username: string;
  password: string;
  repeatpassword?: string;
}
interface ICheckUsernameBody {
  username: string;
}
interface IProfile {
  name: string;
  id: number;
}

export { IAuthUserBody, ICheckUsernameBody, IProfile };
