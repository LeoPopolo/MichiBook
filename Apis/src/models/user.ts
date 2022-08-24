import bcrypt from 'bcryptjs';

interface DataExtension {
    email: string;                       
    phone_number: string;              
    address: string;                     
}

export class User {
    id?: number;
    username: string;
    name: string;
    surname: string;
    role: string;
    password: string;
    contact_information: DataExtension;

    constructor(username: string, name: string, surname: string, role: string, password: string, contact_information: DataExtension, id?: number) { 
        this.username = username;
        this.name = name;
        this.surname = surname;
        this.role = role;
        this.password = password;
        this.contact_information = contact_information;

        if (id) {
            this.id = id;
        }
    }

    async encryptPassword(password) {
        const salt = await bcrypt.genSalt(10);

        let response: string = null;

        await bcrypt.hash(password, salt)
        .then(resp => {
            response = resp;            
        });

        if (response) {
            return response;
        }
    }

    async validatePassword(password: string) {
        return await bcrypt.compare(password, this.password);
    }

    private parseContactInformation() {
        return `(${this.contact_information.email}, ${this.contact_information.phone_number}, ${this.contact_information.address})::data_extension`;
    }

    toString(){
        return `'${this.name}','${this.surname}','${this.username}','${this.password}','${this.role}','${this.parseContactInformation()}'`;
    }

    responseDto() {
        const user: any = {
            id: this.id,
            name: this.name,
            surname: this.surname,
            username: this.username,
            email: this.email,
            role: this.role
        }

        return user;
    }
}