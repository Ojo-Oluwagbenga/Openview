import 'package:flutter/material.dart';

import 'dart:async';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  // This is deceleration of the variable

  @override
  void initState() {
    super.initState();

    // This is to delay the navigation to the next screen
    Timer(const Duration(seconds: 6), () {
      Navigator.pushNamed(context, 'a');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Center(
            child: CircleAvatar(
              radius: 70,
              child: Image.asset('images/one.png'),
            ),
          )
        ],
      ),
    );
  }
}
