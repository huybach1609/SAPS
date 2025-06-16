plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "vn.edu.fpt.sapsmobile"
    compileSdk = 35

    buildFeatures{
        buildConfig = true
    }
    buildTypes{
        debug {
            buildConfigField("String", "SERVER_CLIENT_ID","\"275429573503-526ri9oq1obai6d1qmj4qd07njuhahtk.apps.googleusercontent.com\"")
            buildConfigField("String", "SERVER_BASE_URL","\"http://192.168.1.21:5093/\"")
        }
        release {
            buildConfigField("String", "SERVER_CLIENT_ID","\"275429573503-526ri9oq1obai6d1qmj4qd07njuhahtk.apps.googleusercontent.com\"")
        }
    }

    defaultConfig {
        applicationId = "vn.edu.fpt.sapsmobile"
        minSdk = 27
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {

    implementation ("com.github.bumptech.glide:glide:4.16.0")
    implementation ("com.google.android.material:material:1.12.0")
    implementation ("com.google.android.gms:play-services-auth:21.3.0")
    implementation ("com.squareup.retrofit2:retrofit:2.9.0")
    implementation ("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation ("com.squareup.okhttp3:logging-interceptor:4.11.0")

    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
}