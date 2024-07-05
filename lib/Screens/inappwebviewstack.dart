import 'dart:convert';
import 'dart:io';
import 'dart:isolate';
import 'dart:ui';

import 'package:bluetooth_enable_fork/bluetooth_enable_fork.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:one_klass/api/firebase_api.dart';
import 'package:one_klass/bluthoothswitch.dart';
import 'package:one_klass/localnotification.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_downloader/flutter_downloader.dart';
import 'package:path_provider/path_provider.dart';
import 'package:one_klass/components/databaseCache.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:bluetooth_classic/models/device.dart';
import 'package:flutter/material.dart';
import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

import 'package:flutter/services.dart';
import 'package:bluetooth_classic/bluetooth_classic.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

int Alarmtime = 0;
bool CancelAlarm = false;

class MyInApp extends StatefulWidget {
  @override
  _MyInAppState createState() => _MyInAppState();
}

class _MyInAppState extends State<MyInApp> {
  final GlobalKey webViewKey = GlobalKey();

  final ReceivePort _port = ReceivePort();
  late InAppWebViewController webViewController;

  PullToRefreshController? pullToRefreshController;

  bool pullToRefreshEnabled = true;
  String? b;

  Cache? item;

  var BluethoothStats;
  bool bluethootIsOn = false;

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  ////////////////
  ///
  ///
  final _bluetoothClassicPlugin = BluetoothClassic();
  List device = [];
  Map<String, Map> discoveredDevices = {};
  bool scanning = false;

  //////////////////////////////////
  ////////////////////////////
  /////////////////////
/////////////////////

  Future<void> enableBT() async {
    await BluetoothEnable.enableBluetooth.then((value) {
      print(value);
    });
  }

  Future<Position> position() async {
    Position pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium);
    return pos;
  }

  Future<void> scan() async {
    // await _bluetoothClassicPlugin.initPermissions();
    // Create a StreamSubscription to get notified of adapter state changes
    StreamSubscription<BluetoothAdapterState> stateSubscription;

    Future<String> name = FlutterBluePlus.adapterName;

    print("hhhhhhhhhhhhhhhhhhhhhhh");
    print(name);

    stateSubscription = FlutterBluePlus.adapterState.listen((state) {
      print("Adapter state: $state");

      // Handle different states accordingly
      if (state == BluetoothAdapterState.on) {
        setState(() {
          scanning = true;
        });

        print("Bluetooth is on, you can now scan for devices.");
      } else if (state == BluetoothAdapterState.off) {
        setState(() {
          scanning = false;
        });

        print("Bluetooth is turned off, please enable it.");
      }
    });

    // await FlutterBluePlus.startScan(timeout: Duration(seconds: 5));
    // var result = FlutterBluePlus.scanResults;
    // print(result);

    await _bluetoothClassicPlugin.startScan();
    _bluetoothClassicPlugin.onDeviceDiscovered().listen(
      (event) {
        setState(() {
          discoveredDevices[event.address] = {"name": event.name, "rssi": 0};
        });
        print("cooooodeeeeeeeeeeeeeeeeeeee");
        discoveredDevices = discoveredDevices;
        print(discoveredDevices);

        print("cooooodeeeeeeeeeeeeeeeeeee");
      },
    );
  }

  /// finger print
  late bool authenticated;
  final LocalAuthentication auth = LocalAuthentication();
  Future<bool> authenticateWithBiometrics() async {
    try {
      // setState(() {
      //   _isAuthenticating = true;
      //   _authorized = 'Authenticating';
      // });
      authenticated = await auth.authenticate(
        localizedReason:
            'Scan your fingerprint (or face or whatever) to authenticate',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );

      print(authenticated);
      setState(() {});
    } on PlatformException catch (e) {
      print(e);
      setState(() {});
      return false;
    }
    if (!mounted) {
      return false;
    }

    final String message = authenticated ? 'Authorized' : 'Not Authorized';
    // setState(() {
    //   _authorized = message;
    // });
    return authenticated;
  }

  // void requestCameraPermission() async {
  //   final ble = await Permission.bluetooth.request();
  //   final location = await Permission.location.request();

  //   final blecon = await Permission.bluetoothConnect.request();
  //   final blescan = await Permission.bluetoothScan.request();
  //   if (status == PermissionStatus.granted &&
  //       foot == PermissionStatus.granted) {
  //     // Permission granted.
  //   } else if (status == PermissionStatus.denied &&
  //       foot == PermissionStatus.denied) {
  //     await Permission.bluetooth.request();
  //     await Permission.location.request();

  //     await Permission.camera.request();
  //     await Permission.storage.request();

  //     await Permission.bluetoothConnect.request();
  //     await Permission.bluetoothScan.request();
  //     // Permission denied.
  //   } else if (status == PermissionStatus.permanentlyDenied &&
  //       foot == PermissionStatus.permanentlyDenied) {
  //     // Permission permanently denied.
  //   }
  // }

  Future<bool> _goBack() async {
    var value = await webViewController.canGoBack();
    if (value) {
      webViewController.goBack();
      return false;
    } else {
      exit(0);
    }
  }

  bool copy(List<dynamic> params) {
    Clipboard.setData(ClipboardData(text: params[0]));
    return true;
  }

  @override
  void initState() {
    // copy();

    LocalNotification.initialize(flutterLocalNotificationsPlugin);
    tz.initializeTimeZones();

    super.initState();
    //requestPermissions();

    FlutterDownloader.registerCallback(downloadCallback);

    pullToRefreshController = kIsWeb
        ? null
        : PullToRefreshController(
            options: PullToRefreshOptions(
              color: Colors.blue,
            ),
            onRefresh: () async {
              if (defaultTargetPlatform == TargetPlatform.android) {
                webViewController.reload();
              } else if (defaultTargetPlatform == TargetPlatform.iOS) {
                webViewController.loadUrl(
                    urlRequest:
                        URLRequest(url: await webViewController.getUrl()));
              }
            },
          );
    scan();
  }

  //   void requestPermissions() async {
  //   await Permission.location.request();
  //   await Permission.camera.request();
  //   await Permission.storage.request();
  //   await Permission.bluetooth.request();
  //   await Permission.bluetoothConnect.request();
  //   await Permission.bluetoothScan.request();
  //
  //}

  @override
  void dispose() {
    IsolateNameServer.removePortNameMapping('downloader_send_port');
    super.dispose();
  }

  @pragma('vm:entry-point')
  static void downloadCallback(String id, int status, int progress) {
    final SendPort? send =
        IsolateNameServer.lookupPortByName('downloader_send_port');
    send!.send([id, status, progress]);
  }

  var _controller = null;
  Future<bool> checkCanConnect() async {
    try {
      var link = Uri.parse("https://google.com");
      var resp = await http.get(link).timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          // Time has run out, do what you wanted to do.
          return http.Response(
              'Error', 408); // Request Timeout response status code
        },
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    var subscription = Connectivity()
        .onConnectivityChanged
        .listen((ConnectivityResult result) async {
      bool ret = await checkCanConnect();
      _controller.evaluateJavascript(source: "promptNetworkChange($ret);");
    });

    return WillPopScope(
      onWillPop: () => _goBack(),
      child: SafeArea(
        child: Scaffold(
            body: Stack(children: <Widget>[
          InAppWebView(
            androidOnPermissionRequest: (InAppWebViewController controller,
                String origin, List<String> resources) async {
              return PermissionRequestResponse(
                  resources: resources,
                  action: PermissionRequestResponseAction.GRANT);
            },
            onLoadStop: (controller, url) {
              pullToRefreshController?.endRefreshing();
            },
            initialOptions: InAppWebViewGroupOptions(
              crossPlatform: InAppWebViewOptions(
                  cacheEnabled: false,
                  mediaPlaybackRequiresUserGesture: false,
                  useOnDownloadStart: true,
                  javaScriptEnabled: true,
                  disableVerticalScroll: false,
                  disableHorizontalScroll: false),
            ),
            onDownloadStartRequest: (controller, url) async {
              Directory? tempDir = await getExternalStorageDirectory();
              setState(() {});

              await FlutterDownloader.enqueue(
                url: url.url.toString(),
                savedDir: tempDir!.path,
                showNotification: true,
                fileName: 'testing',
                // url.suggestedFilename,
                saveInPublicStorage: true,
                // show download progress in status bar (for Android)
                openFileFromNotification:
                    true, // click on notification to open downloaded file (for Android)
              );
            },
            onLoadError: (controller, url, i, s) {
              webViewController.loadFile(
                  assetFilePath: "assets/static/not_found.html");
            },
            onLoadHttpError: (controller, url, i, s) {
              webViewController.loadFile(
                  assetFilePath: "assets/static/not_found.html");
            },
            key: webViewKey,
            initialUrlRequest: URLRequest(
                url: Uri.parse(
                    "http://localhost:8080/assets/static/dashboard.html")),
            // URLRequest(url: Uri.parse('http://oneklass2.oauife.edu.ng')),
            pullToRefreshController: pullToRefreshController,
            onWebViewCreated: (controller) {
              webViewController = controller;
              _controller =
                  controller; //THIS ASSIGNMENT ALLOWS ME TO MANIPULATE THE CODE FROM ABOVE

              controller.addJavaScriptHandler(
                handlerName: 'clipboardManager',
                callback: (args) {
                  return copy(args);
                },
              );
              controller.addJavaScriptHandler(
                handlerName: 'openExternal',
                callback: (args) async {
                  for (String a in args) {
                    if (await canLaunchUrl(Uri.parse(a))) {
                      await launchUrl(Uri.parse(a));
                    } else {
                      const ScaffoldMessenger(
                        child: Text('Unable to complete action, try again'),
                      );
                      throw 'Could not launch $a';
                    }
                  }
                },
              );

              controller.addJavaScriptHandler(
                  handlerName: "getFCM",
                  callback: (args) async {
                    print("Fcm token");
                    print(fCMToken);

                    return (fCMToken);
                  });

              controller.addJavaScriptHandler(
                  handlerName: "getBluetoothDevices",
                  callback: (args) async {
                    print("hheeeeeeeeeyyyyyyyy");
                    if (scanning == false) {
                      enableBT();
                      scan();

                      return ({});
                    } else {
                      scan();
                      print("ffffffffffffffffffhhhhhhhhhhhhhhhhhhhhhhh");
                      print(discoveredDevices);
                      return (discoveredDevices);
                    }
                  });

              controller.addJavaScriptHandler(
                  handlerName: "authFingerprint",
                  callback: (args) async {
                    return await authenticateWithBiometrics();
                  });
              controller.addJavaScriptHandler(
                  handlerName: "getLocation",
                  callback: (args) async {
                    return await position();
                  });
              controller.addJavaScriptHandler(
                  handlerName: "requestHandle",
                  callback: (args) async {
                    for (var a in args) {
                      var dict = a[0];
                      print(dict);
                      var route = dict["route"];
                      var url = dict["url"];
                      print(
                          "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgggggggggggggggggggggggggggggggggggggg");
                      print(url);
                      var link = Uri.parse(url);
                      Map data = dict["data"];
                      var pair = data["fetchpair"];
                      var set = data["fetchset"];

                      print(data);

                      print(data["fetchpair"]);
                      print(data["fetchset"]);
                      var response =
                          await http.post(link, body: jsonEncode(data));
                      //     await http.post(link, body: {
                      //   // "fetchpair": {"id__gt": "0"}.toString(),
                      //   // "fetchset": "[]"
                      // });
                      print("The resp0202");
                      print(response);
                      return (response.body);
                    }
                  });

              controller.addJavaScriptHandler(
                  handlerName: "checkCanConnect",
                  callback: (args) async {
                    return await checkCanConnect();
                  });

              controller.addJavaScriptHandler(
                handlerName: 'writeCache',
                callback: (args) async {
                  int r = 1;
                  for (List a in args) {
                    item = Cache(type: a[0], packet: a[1], id: r);

                    bool take = await DatabaseCache.updateCache(
                      item!,
                    );
                    if (take == false) {
                      await DatabaseCache.addCache(item!);
                    }
                    r++;
                  }
                },
              );
              controller.addJavaScriptHandler(
                handlerName: 'fetchCache',
                callback: (args) async {
                  List jet = [];
                  for (String a in args) {
                    List<Map<String, dynamic>>? geo =
                        await DatabaseCache.getCache(a);

                    jet.add(geo);
                  }
                  controller.callAsyncJavaScript(
                      functionBody: ("my_item_to_return"));

                  return jet;
                  //  await _loadCache(b!);
                },
              );
              controller.addJavaScriptHandler(
                  handlerName: 'SetNotification',
                  callback: (args) async {
                    Alarmtime = args[0];
                    return (Alarmtime);
                  });

              controller.addJavaScriptHandler(
                  handlerName: 'DeleteNotification',
                  callback: (args) async {
                    CancelAlarm = true;
                  });

              controller.addJavaScriptHandler(
                handlerName: 'deleteCache',
                callback: (args) async {
                  for (String a in args) {
                    await DatabaseCache.deleteCache(Cache(type: a, packet: a));
                  }
                },
              );
              controller.addJavaScriptHandler(
                handlerName: 'handlePdf',
                callback: (args) async {
                  Directory? tempDir = await getExternalStorageDirectory();

                  for (String a in args) {
                    await FlutterDownloader.enqueue(
                      url: a,
                      savedDir: tempDir!.path,
                      showNotification: true,
                      fileName: 'OneKlass',
                      saveInPublicStorage: true,
                      // show download progress in status bar (for Android)
                      openFileFromNotification:
                          true, // click on notification to open downloaded file (for Android)
                    );
                  }
                },
              );
            },
            onProgressChanged: (controller, progress) {
              if (progress == 100) {
                pullToRefreshController?.endRefreshing();
              }
            },
          ),
        ])),
      ),
    );
  }
}
