interface IRegisterUserBody {
  name: string;
  username: string;
  password: string;
}

interface ILoginUserBody {
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

export { IRegisterUserBody, ILoginUserBody, ICheckUsernameBody, IProfile };
