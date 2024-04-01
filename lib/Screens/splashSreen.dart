import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:async';
import 'dart:io';
import 'dart:developer' as developer;
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // This is deceleration of the variable
  final GlobalKey webViewKey = GlobalKey();
  late InAppWebViewController webViewController;

  PullToRefreshController? pullToRefreshController;

  String? connection;
  ConnectivityResult? _connectionStatus;
  final Connectivity _connectivity = Connectivity();
  late StreamSubscription<ConnectivityResult> _connectivitySubscription;

  @override
  void initState() {
    super.initState();
    initConnectivity();

    // webViewController =InAppWebViewController()
    //   ..loadFile(assetFilePath: 'assets/static/splash.html');

    // checkInternet();

    _connectivitySubscription =
        _connectivity.onConnectivityChanged.listen(_updateConnectionStatus);
    // This is to delay the navigation to the next screen
    //   Timer(const Duration(seconds: 5), () {
    //     initConnectivity();
    //   });
  }

  @override
  void dispose() {
    _connectivitySubscription.cancel();

    super.dispose();
  }

  // Function that check internet connection and controls the navigation to the next screen
  Future<void> initConnectivity() async {
    late ConnectivityResult result;
    // Platform messages may fail, so we use a try/catch PlatformException.
    try {
      result = await _connectivity.checkConnectivity();
      setState(() {
        _connectionStatus = result;
      });
      if (_connectionStatus == ConnectivityResult.mobile ||
          _connectionStatus == ConnectivityResult.wifi ||
          _connectionStatus == ConnectivityResult.vpn) {
        try {
          final resultA = await InternetAddress.lookup('google.com');
          if (resultA.isNotEmpty && resultA[0].rawAddress.isNotEmpty) {
            Timer(const Duration(seconds: 1), () {
              setState(() {
                connection = 'connected';
                Navigator.pushNamed(context, 'ar');
              });
            });
          } else {
            Timer(const Duration(seconds: 1), () {
              setState(() {
                connection = 'not connected';
                Navigator.pushNamed(context, 'ad');
              });
            });
          }
        } on SocketException catch (_) {
          Timer(const Duration(seconds: 1), () {
            setState(() {
              connection = 'not connected';
              Navigator.pushNamed(context, 'ad');
            });
          });
        }
      } else {
        Timer(const Duration(seconds: 1), () {
          setState(() {
            connection = 'not connected';
            Navigator.pushNamed(context, 'ad');
          });
        });
      }
    } on PlatformException catch (e) {
      developer.log('Couldn\'t check connectivity status', error: e);
      Timer(const Duration(seconds: 1), () {
        setState(() {
          connection = 'not connected';
          Navigator.pushNamed(context, 'ad');
        });
      });
      return;
    }

    // If the widget was removed from the tree while the asynchronous platform
    // message was in flight, we want to discard the reply rather than calling
    // setState to update our non-existent appearance.
    if (!mounted) {
      // return Future.value(null);
      Timer(const Duration(seconds: 1), () {
        setState(() {
          connection = 'not connected';
          Navigator.pushNamed(context, 'ad');
        });
      });
    }

    return _updateConnectionStatus(result);
  }

  Future<void> _updateConnectionStatus(ConnectivityResult result) async {
    setState(() {
      _connectionStatus = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
    );
    // return Scaffold(
    //   body: Stack(
    //     children: [
    //       InAppWebView(
    //         onWebViewCreated: (controller) async {
    //           webViewController = controller;
    //           controller.loadFile(assetFilePath: 'assets/static/splash.html');
    //         },
    //       )
    //     ],
    //   ),
    // );
  }
}
