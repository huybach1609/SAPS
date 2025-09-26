plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "vn.edu.fpt.sapsmobile"
    compileSdk = 35

    buildFeatures {
        buildConfig = true
    }
    buildTypes {
        debug {
            buildConfigField(
                "String",
                "GOOGLE_CLIENT_ID",
                "\"275429573503-526ri9oq1obai6d1qmj4qd07njuhahtk.apps.googleusercontent.com\""
            )
            buildConfigField("String", "API_BASE_URL", "\"https://192.168.1.23:7040/\"")
            buildConfigField("boolean", "ENABLE_LOGGING", "true")

        }
        release {
            isMinifyEnabled = false
            buildConfigField(
                "String",
                "GOOGLE_CLIENT_ID",
                "\"275429573503-526ri9oq1obai6d1qmj4qd07njuhahtk.apps.googleusercontent.com\""
            )
            buildConfigField(
                "String",
                "API_BASE_URL",
                "\"https://anemosnguyen2409.southeastasia.cloudapp.azure.com/\""
            )
            buildConfigField("boolean", "ENABLE_LOGGING", "false")
        }
    }

    defaultConfig {
        applicationId = "vn.edu.fpt.sapsmobile"
        minSdk = 27
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        buildConfigField("String", "BASE_URL_DEV", "\"https://192.168.1.23:7040/\"")
        buildConfigField("String", "BASE_URL_STAGING", "\"http://172.188.240.201/\"")
        buildConfigField(
            "String",
            "BASE_URL_PROD",
            "\"https://anemosnguyen2409.southeastasia.cloudapp.azure.com/\""
        )
        buildConfigField("boolean", "ENABLE_LOGGING", "true")
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

    implementation("com.github.bumptech.glide:glide:4.16.0")
    implementation("com.google.android.material:material:1.14.0-alpha01")
    implementation("com.google.android.gms:play-services-auth:21.3.0")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.google.code.gson:gson:2.10.1")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
    implementation("com.journeyapps:zxing-android-embedded:4.3.0")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("com.auth0.android:jwtdecode:2.0.2")

    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    implementation(libs.swiperefreshlayout)
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
}