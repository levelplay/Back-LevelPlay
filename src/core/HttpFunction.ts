export function successMessage(data: any, message: string) {
    return {success: true, message: message, data: data};
}

export function errorMessage( message: string) {
    return {success: false, message: message};
}