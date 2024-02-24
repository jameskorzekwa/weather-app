export const getTemp = (temp: number, type: string) => {
    if (type === "c") {
        return Math.round(temp - 273)
    } else if (type === "f") {
        return Math.round((temp - 273) * (9 / 5) + 32)
    }
}

export const getPrecipitationPercent = (pop: number) => {
    return pop * 100 + "%"
}