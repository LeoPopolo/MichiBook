import bcrypt from 'bcryptjs';

export async function encryptPassword(password: string) {
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

export async function validatePassword(password: string, compare_password: string) {
    return await bcrypt.compare(password, compare_password);
}