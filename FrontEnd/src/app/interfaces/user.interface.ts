export interface User {
  id: number;
  personal_data: PersonalData;
  contact_information: DataExtension;
  friendship_status?: string;
}

interface PersonalData {
  name: string;
  surname: string;
  username: string;
  password: string;
  image_path: string;
  profile_description: string;
}

interface DataExtension {
  email: string;
  phone_number: string;
  address: string;
}

export function createUser(): User {
  return {
    id: 0,
    personal_data: {
      name: '',
      surname: '',
      username: '',
      password: '',
      image_path: '',
      profile_description: ''
    },
    contact_information: {
      email: '',
      phone_number: '',
      address: ''
    }
  }
}
