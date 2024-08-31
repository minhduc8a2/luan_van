export async function getConnectedDevices(type) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === type);
}
export async function getVideoStream(cameraId, minWidth, minHeight) {
    const constraints = {
        video: {
            deviceId: cameraId,
            width: { min: minWidth },
            height: { min: minHeight },
        },
    };

    return navigator.mediaDevices.getUserMedia(constraints);
}
export async function getScreenStream() {
    const constraints = {
        video: true,
    };

    return navigator.mediaDevices.getDisplayMedia(constraints);
}
export async function getAudioStream(audioId) {
    const constraints = {
        audio: audioId
            ? { deviceId: audioId, echoCancellation: true }
            : { echoCancellation: true },
    };

    return navigator.mediaDevices.getUserMedia(constraints);
}
export function stopStream(stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
        track.stop();
    });
}
export function getDevicesInUse(type, stream) {
    if (!stream) return new Map();
    if (type == "audio") {
        const audioTracks = stream.getAudioTracks();
        const result = new Map();
        audioTracks.forEach((track, index) => {
            result.set(track.getSettings().deviceId, {
                label: track.label,
                deviceId: track.getSettings().deviceId,
                kind: track.kind,
            });
        });
        return result;
    } else if (type == "video") {
        const videoTracks = stream.getVideoTracks();
        const result = new Map();
        videoTracks.forEach((track, index) => {
            result.set(track.getSettings().deviceId, {
                label: track.label,
                deviceId: track.getSettings().deviceId,
                kind: track.kind,
            });
        });
        return result;
    }
}
export function checkDeviceInUse(type, stream, deviceId) {
    if (!stream) return false;
    if (type == "audio") {
        const audioTracks = stream.getAudioTracks();
        let result = false;
        audioTracks.forEach((track, index) => {
            if (deviceId == track.getSettings().deviceId) {
                console.log("in use", track.label);
                result = true;
            }
        });

        return result;
    } else if (type == "video") {
        const videoTracks = stream.getVideoTracks();
        let result = false;
        videoTracks.forEach((track, index) => {
            if (deviceId == track.getSettings().deviceId) {
                console.log("in use", track.label);
                result = true;
            }
        });
        return result;
    }
}
export function streamHasVideoTracks(stream) {
    if (!stream) return false;
    return stream.getVideoTracks().length > 0;
}
export function streamHasAudioTracks(stream) {
    if (!stream) return false;
    return stream.getAudioTracks().length > 0;
}

export function removeVideoTracks(stream) {
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach((track) => {
        stream.removeTrack(track);
        track.stop();
    });
}
