import { auth } from "@/firebaseConfig"; // your Firebase app
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    // iosClientId: "YOUR_IOS_CLIENT_ID",
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_KEY,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((result) => {
          console.log("Logged in user:", result.user);
        })
        .catch((err) => console.error("Firebase Google login failed", err));
    }
  }, [response]);

  return {
    promptAsync,
    request,
  };
};
