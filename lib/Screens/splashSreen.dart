import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:async';
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
    Navigator.pushNamed(context, "ar");
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
