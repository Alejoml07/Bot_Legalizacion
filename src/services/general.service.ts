export const getFormattedDate = (): string => {

    const date = new Date();

    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

}

export const transportType = (index: number): string => {

    const transports = [
        'Taxi',
        'Bus',
        'Metro',
        'Otro'
    ];

    return transports[index - 1];

}

export const formatNumberWithCommas = (value: number): string => {

    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}

export const getDayOfWeek = (dateString: string): string => {

    const [day, month, year] = dateString.split('-').map(Number);

    const date = new Date(year, month - 1, day); // month is 0-indexed

    const daysOfWeek = [
        'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
    ];

    return daysOfWeek[date.getDay()];

}

export const generateRandomCode = (letterCount: number = 5, digitCount: number = 5): string => {

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const digits = '0123456789';

    let result = '';

    // Add random letters
    for (let i = 0; i < letterCount; i++) {

        result += letters.charAt(Math.floor(Math.random() * letters.length));

    }

    // Add random digits
    for (let i = 0; i < digitCount; i++) {

        result += digits.charAt(Math.floor(Math.random() * digits.length));

    }

    return result.toLowerCase();

}

export const getCurrentDate = (): string => {

    const today = new Date();

    const day = String(today.getDate()).padStart(2, '0');

    const month = String(today.getMonth() + 1).padStart(2, '0');

    const year = today.getFullYear();

    return `${day}-${month}-${year}`;

}