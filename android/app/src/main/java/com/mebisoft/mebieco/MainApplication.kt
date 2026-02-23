package com.mebisoft.mebieco

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }

  override fun getResources(): android.content.res.Resources {
    val res = super.getResources()
    val config = android.content.res.Configuration(res.configuration)
    config.fontScale = 1.0f
    res.updateConfiguration(config, res.displayMetrics)
    return res
  }
}

