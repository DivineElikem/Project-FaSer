import React from "react"
import { View, StyleSheet, ViewStyle } from "react-native"
import { WebView } from "react-native-webview"

interface MJPEGPlayerProps {
  streamUrl: string
  style?: ViewStyle
  onLoadEnd?: () => void
  onError?: () => void
}

export default function MJPEGPlayer({ streamUrl, style, onLoadEnd, onError }: MJPEGPlayerProps) {
  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{
          html: `
            <html><body style='margin:0;padding:0;background:black;'>
              <img id='mjpeg' src='${streamUrl}' style='width:100vw;height:100vh;object-fit:contain;background:black;'/>
              <script>
                var img = document.getElementById('mjpeg');
                img.onload = function() { window.ReactNativeWebView.postMessage('loaded'); };
                img.onerror = function() { window.ReactNativeWebView.postMessage('error'); };
              </script>
            </body></html>
          `,
        }}
        style={{ flex: 1, backgroundColor: "black" }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={event => {
          if (event.nativeEvent.data === "loaded" && onLoadEnd) onLoadEnd()
          if (event.nativeEvent.data === "error" && onError) onError()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    borderRadius: 8,
    overflow: "hidden",
  },
})
