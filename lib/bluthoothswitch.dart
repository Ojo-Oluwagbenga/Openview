import 'package:flutter/material.dart';
import 'package:flutter_blue/flutter_blue.dart';

class BluetoothSwitch extends StatefulWidget {
  @override
  _BluetoothSwitchState createState() => _BluetoothSwitchState();
}

class _BluetoothSwitchState extends State<BluetoothSwitch> {
  bool _bluetoothEnabled = false;

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      title: Text('Bluetooth'),
      value: _bluetoothEnabled,
      onChanged: (newValue) {
        setState(() {
          _bluetoothEnabled = newValue;
          _toggleBluetooth(newValue);
        });
      },
    );
  }

  Future<void> _toggleBluetooth(bool enable) async {
    if (enable) {
      // Enable Bluetooth
      await FlutterBlue.instance.startScan(timeout: Duration(seconds: 4));
    } else {
      // Disable Bluetooth
      await FlutterBlue.instance.stopScan();
    }
  }
}
