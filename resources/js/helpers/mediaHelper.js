export async function getConnectedDevices(type) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
    return devices.filter((device) => device.kind === type);
}
export async function openCamera(cameraId, minWidth, minHeight) {
    const constraints = {
        audio: { echoCancellation: true },
        video: {
            deviceId: cameraId,
            width: { min: minWidth },
            height: { min: minHeight },
        },
    };

    return navigator.mediaDevices.getUserMedia(constraints);
}
export function stopStream(stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
        track.stop();
    });
    console.log("stopStream called");
}
