import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:one_klass/api/firebase_api.dart';
import 'package:one_klass/firebase_options.dart';
import 'package:permission_handler/permission_handler.dart';
import 'Screens/splashSreen.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';

import 'Screens/logoScreen.dart';
import 'Screens/popUp.dart';
import 'package:flutter/services.dart';
import 'package:flutter_downloader/flutter_downloader.dart';
import 'dart:async';

import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'Screens/inappwebviewstack.dart';
import 'Screens/inpplocalfile.dart';
import 'Screens/queryCache.dart';
// import 'package:google_api_availability/google_api_availability.dart';

final InAppLocalhostServer localhostServer = InAppLocalhostServer();

Future<void> requestPermissions() async {
  await Permission.location.request();
  await Permission.camera.request();
  await Permission.storage.request();
  await Permission.bluetooth.request();
  await Permission.bluetoothConnect.request();
  await Permission.bluetoothScan.request();
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // GooglePlayServicesAvailability availability = await GoogleApiAvailability
  //     .instance
  //     .checkGooglePlayServicesAvailability();

  try {
    await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform);
    FirebaseApi().initNotifications();
  } catch (error) {
    print(error);
  }

  await FlutterDownloader.initialize(
      debug: false,
      // optional: set to false to disable printing logs to console (default: true)
      ignoreSsl:
          true // option: set to false to disable working with http links (default: false)
      );

  if (Platform.isAndroid) {
    await AndroidInAppWebViewController.setWebContentsDebuggingEnabled(true);
  }
  await localhostServer.start();
  await requestPermissions();

  print("Got to the delay shi");
  // await Future.delayed(const Duration(seconds: 10));
  // FlutterNativeSplash.remove();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget with WidgetsBindingObserver {
  const MyApp({super.key});

  @override
  void initState() {
    WidgetsBinding.instance.addObserver(this); // <--
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    print("state.name");
    print(state.name);
    super.didChangeAppLifecycleState(state);
  }

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.dark.copyWith(
        statusBarColor: Color.fromARGB(255, 245, 245, 245),
        systemNavigationBarColor: Color.fromARGB(255, 255, 255, 255)));

    SystemChrome.setApplicationSwitcherDescription(
        ApplicationSwitcherDescription(
      label: 'OneKlass',
      primaryColor: Colors.white.value,
    ));
    return MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'OneKlass',
        theme: ThemeData(
          primaryIconTheme:
              const IconThemeData(color: Color.fromARGB(255, 228, 102, 102)),
          colorScheme: ColorScheme.fromSeed(
              seedColor: const Color.fromARGB(255, 255, 255, 255)),
          useMaterial3: true,
        ),
        // initialRoute: 'aaa',
        initialRoute: 'ar',
        // home: const HomeScreen(),

        routes: {
          'a': (context) => const HomeScreen(),
          'aaa': (context) => const SplashScreen(),
          'ad': (context) => const NoNetworkScreen(),
          'ar': (context) => MyInApp(),
          'arn': (context) => InAppLocal(),
          'qc': (context) => const FirstTimer(),
        });
  }
}
