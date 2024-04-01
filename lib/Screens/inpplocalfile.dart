import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';

import 'package:one_klass/components/databaseCache.dart';

class InAppLocal extends StatefulWidget {
  InAppLocal({super.key});

  @override
  State<InAppLocal> createState() => _InAppLocalState();
}

class _InAppLocalState extends State<InAppLocal> {
  final GlobalKey webViewKey = GlobalKey();
  late InAppWebViewController webViewController;
  Cache? item;

  PullToRefreshController? pullToRefreshController;

  bool pullToRefreshEnabled = true;

  Future<bool> _goBack() async {
    var value = await webViewController.canGoBack();
    if (value) {
      webViewController.goBack();
      return false;
    } else {
      return true;
    }
  }

  Future<void> requestCameraPermission() async {
    final status = await Permission.camera.request();
    final foot = await Permission.storage.request();
    if (status == PermissionStatus.granted &&
        foot == PermissionStatus.granted) {
      debugPrint('granted');
      // Permission granted.
    } else if (status == PermissionStatus.denied &&
        foot == PermissionStatus.denied) {
      // Permission denied.
    } else if (status == PermissionStatus.permanentlyDenied &&
        foot == PermissionStatus.permanentlyDenied) {
      // Permission permanently denied.
    }
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    requestCameraPermission();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () => _goBack(),
      child: SafeArea(
        child: Scaffold(
          body: Stack(
            children: [
              InAppWebView(
                initialUrlRequest: URLRequest(
                    url: Uri.parse(
                        "http://localhost:8080/assets/static/takeattendance.html")),
                androidOnPermissionRequest: (InAppWebViewController controller,
                    String origin, List<String> resources) async {
                  return PermissionRequestResponse(
                      resources: resources,
                      action: PermissionRequestResponseAction.GRANT);
                },
                onWebViewCreated: (controller) async {
                  webViewController = controller;

                  controller.addJavaScriptHandler(
                    handlerName: 'writeCache',
                    callback: (args) async {
                      int r = 5;
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

                      return jet;
                      //  await _loadCache(b!);
                    },
                  );
                  controller.addJavaScriptHandler(
                    handlerName: 'deleteCache',
                    callback: (args) async {
                      for (String a in args) {
                        await DatabaseCache.deleteCache(
                            Cache(type: a, packet: a));
                      }
                    },
                  );
                },
                onLoadStart: (controller, url) {},
                onLoadStop: (controller, url) {},
                initialOptions: InAppWebViewGroupOptions(
                  crossPlatform: InAppWebViewOptions(
                      mediaPlaybackRequiresUserGesture: false,
                      javaScriptEnabled: true),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
