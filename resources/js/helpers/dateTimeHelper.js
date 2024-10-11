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
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    };

    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };

    const formattedDate = localDate.toLocaleDateString("vi-VN", dateOptions);
    const formattedTime = localDate
        .toLocaleTimeString("vi-VN", timeOptions)
        .replace("SA", "AM")
        .replace("CH", "PM");

    return `${formattedDate}, ${formattedTime}`;
}
export function differenceInSeconds(utcTime1, utcTime2) {
    const date1 = new Date(utcTime1);
    const date2 = new Date(utcTime2);

    try {
        const differenceInMilliseconds = date2.getTime() - date1.getTime();
        console.log(utcTime1,utcTime2,differenceInMilliseconds/10);
        return Math.abs(differenceInMilliseconds / 1000);
    } catch (error) {
        console.log(error);
        return 1000;
    }
}

export function differenceInDate(utcTime_1, utcTime_2) {
    const date1 = new Date(utcTime_1);
    const date2 = new Date(utcTime_2);

    const diffInMilliseconds = date2 - date1;

    const diffInDays = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24));

    return diffInDays;
}
export function formatDDMMYYY(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, "0"); // Get the day and add leading zero if needed
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS, so add 1
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
}
export function groupListByDate(list) {
    const groupedList = list.reduce((grouped, item) => {
        // Convert the timestamp to a Date object
        const dateObj = new Date(item.created_at);

        // Format the date to "dd/mm/yyyy"
        const day = String(dateObj.getDate()).padStart(2, "0"); // Get the day and add leading zero if needed
        const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS, so add 1
        const year = dateObj.getFullYear();

        const formattedDate = `${year}-${month}-${day}`; // Construct the "dd/mm/yyyy" format

        // If the date is not already a key in the grouped object, create it
        if (!grouped[formattedDate]) {
            grouped[formattedDate] = [];
        }

        // Add the current item to the corresponding date group
        grouped[formattedDate].push(item);

        return grouped;
    }, {});
    Object.keys(groupedList).forEach((key) => {
        groupedList[key].sort((a, b) =>
            compareDateTime(a.created_at, b.created_at)
        );
    });
    return groupedList;
}

export function compareDateTime(dateString1, dateString2) {
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);
    return date1 - date2;
}

export const formatToMinuteSecond = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};
