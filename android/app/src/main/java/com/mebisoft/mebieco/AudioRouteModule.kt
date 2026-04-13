package com.mebisoft.mebieco

import android.content.Context
import android.media.AudioManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AudioRouteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AudioRouteModule"
    }

    @ReactMethod
    fun setSpeakerphoneOn(on: Boolean) {
        val audioManager = reactApplicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            audioManager.isSpeakerphoneOn = on
        }, 500)
    }
}
