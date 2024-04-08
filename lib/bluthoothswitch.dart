// import 'package:flutter/material.dart';
// import 'package:bluetooth_enable_fork/bluetooth_enable_fork.dart';

// void main() => runApp(MyApp());

// class MyApp extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       title: "Test",
//       home: _MyAppState(),
//     );
//   }
// }

// class _MyAppState extends StatelessWidget {
//   Future<void> enableBT() async {
//     BluetoothEnable.enableBluetooth.then((value) {
//       print(value);
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       home: Scaffold(
//         appBar: AppBar(
//           title: const Text(
//             'Bluetooth Enable Plugin',
//           ),
//           centerTitle: true,
//         ),
//         body: Center(
//           child: Column(
//             mainAxisSize: MainAxisSize.min,
//             mainAxisAlignment: MainAxisAlignment.center,
//             children: <Widget>[
//               Text("Press the button to request turning on Bluetooth"),
//               SizedBox(height: 20.0),
//               ElevatedButton(
//                 onPressed: (() {
//                   enableBT();
//                 }),
//                 child: Text('Request to turn on Bluetooth'),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
