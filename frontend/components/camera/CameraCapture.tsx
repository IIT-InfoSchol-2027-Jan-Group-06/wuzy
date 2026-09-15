import { CameraView as Camera, CameraType } from 'expo-camera';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

export type CameraCaptureRef = {
  takePicture: () => void;
};

/** Live camera preview shared by the upload and chat camera flows. Scale on a
 *  wrapper View: a transform on the CameraView itself can break the Android
 *  preview. Snaps the photo once per press via capturingRef, so a double tap
 *  cannot fire two captures. */
export const CameraCapture = forwardRef<
  CameraCaptureRef,
  { type: CameraType; onPictureTaken: (uri: string) => void; onReadyChange: (ready: boolean) => void }
>(({ type, onPictureTaken, onReadyChange }, ref) => {
  const cameraRef = useRef<Camera>(null);
  const capturingRef = useRef(false);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || capturingRef.current) return;
    capturingRef.current = true;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      onPictureTaken(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
    } finally {
      capturingRef.current = false;
    }
  }, [onPictureTaken]);

  useImperativeHandle(ref, () => ({ takePicture }), [takePicture]);

  return (
    <View style={[StyleSheet.absoluteFill, { transform: [{ scale: 1.05 }] }]}>
      <Camera
        ref={cameraRef}
        facing={type}
        style={StyleSheet.absoluteFill}
        onCameraReady={() => onReadyChange(true)}
        onMountError={() => onReadyChange(false)}
      />
    </View>
  );
});

CameraCapture.displayName = 'CameraCapture';