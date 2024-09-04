export function UTCToTime(utcTime) {
    const localDate = new Date(utcTime);
    const options = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    };

    const formattedTime = localDate
        .toLocaleString("vi-VN", options)
        .replace("SA", "AM")
        .replace("CH", "PM");
    return formattedTime;
}
export function UTCToDateTime(utcTime) {
    const localDate = new Date(utcTime);
    
   
    const dateOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    
    const formattedDate = localDate.toLocaleDateString('vi-VN', dateOptions);
    const formattedTime = localDate.toLocaleTimeString('vi-VN', timeOptions)
        .replace('SA', 'AM')
        .replace('CH', 'PM');

    
    return `${formattedDate}, ${formattedTime}`;
}
export function differenceInSeconds(utcTime_1, utcTime_2) {
    const date1 = new Date(utcTime_1);
    const date2 = new Date(utcTime_2);

    const time1InMilliseconds = date1.getTime();
    const time2InMilliseconds = date2.getTime();

    const time1InSeconds = Math.floor(time1InMilliseconds / 1000);
    const time2InSeconds = Math.floor(time2InMilliseconds / 1000);
    // console.log(Math.abs(time1InSeconds - time2InSeconds));
    return Math.abs(time1InSeconds - time2InSeconds);
}
