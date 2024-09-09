export async function getConnectedDevices(type) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === type);
}
export async function getVideoStream(cameraId, minWidth, minHeight) {
    const videoDevices = await getConnectedDevices("videoinput");
    if (cameraId) {
        const constraints = {
            video: {
                deviceId: cameraId,
                width: { min: minWidth },
                height: { min: minHeight },
            },
        };

        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {
            alert("Device is not available.");
        }
    }
    let i = 0;
    while (i++ < videoDevices.length) {
        const constraints = {
            video: {
                deviceId: videoDevices[i].deviceId,
                width: { min: minWidth },
                height: { min: minHeight },
            },
        };
        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {}
    }
    throw new Error("Could not access any video device.");
}
export async function getScreenStream() {
    const constraints = {
        video: true,
    };

    return navigator.mediaDevices.getDisplayMedia(constraints);
}
export async function getAudioStream(audioId) {
    const audioDevices = await getConnectedDevices("audioinput");
    if (audioId) {
        const constraints = {
            audio: {
                deviceId: audioId,
                echoCancellation: true,
            },
        };

        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {
            alert("Device is not available.");
        }
    }

    for (let i = 0; i < audioDevices.length; i++) {
        const constraints = {
            audio: {
                deviceId: audioDevices[i].deviceId,
                echoCancellation: true,
            },
        };
        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {}
    }

    throw new Error("Could not access any audio device.");
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
                result = true;
            }
        });

        return result;
    } else if (type == "video") {
        const videoTracks = stream.getVideoTracks();
        let result = false;
        videoTracks.forEach((track, index) => {
            if (deviceId == track.getSettings().deviceId) {
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
export function removeAudioTracks(stream) {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
        stream.removeTrack(track);
        track.stop();
    });
}
