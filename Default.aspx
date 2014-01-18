<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="AudioTestHost.Default" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>AudioTestHost</title>
    <script src="res/jquery-1.8.2.min.js"></script>
    
    <!-- extra audio scritps -->
    <script src="js/AudioContextMonkeyPatch.js"></script>
    <script src="js/effects.js"></script>
	<script src="js/visualizer/events.js"></script>
	<script src="js/visualizer/base.js"></script>
	<script src="js/visualizer/visualizer.js"></script>
	<script src="js/visualizer/shader.js"></script>

    <script src="res/Default.js"></script>
    <script>$(DefaultClient_Load);</script>
</head>
<body>
    <canvas id="view1" width="750" height="200"></canvas><br/>
    <script>
        window.audioService = new AudioTestHost.AudioService();
        window.audioService.VisualizeTo($("#view1"));
    </script>
    <button onclick="window.audioService.Start();">Start</button>
    <button onclick="window.audioService.Stop();">Stop</button>
    <button onclick="window.audioService.ExportToWAV();">Export to WAV</button>
</body>
</html>
