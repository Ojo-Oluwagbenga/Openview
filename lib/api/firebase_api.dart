import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

late var fCMToken;

Future<void> handelbgmessage(RemoteMessage message) async {}

class FirebaseApi {
  final _firebaseMessaging = FirebaseMessaging.instance;

  Future<String> initNotifications() async {
    await _firebaseMessaging.requestPermission();
    fCMToken = await _firebaseMessaging.getToken();
    print('Token:$fCMToken===');
    FirebaseMessaging.onBackgroundMessage(
        (message) => handelbgmessage(message));

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {});
    return fCMToken;
  }
}
