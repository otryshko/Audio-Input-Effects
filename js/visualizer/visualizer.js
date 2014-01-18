//--------------------------------------------------------------------
// WebGL Analyser
//

AnalyserView = function(canvasElement) {
    this.canvasElement = canvasElement;
    
    // NOTE: the default value of this needs to match the selected radio button

    // This analysis type may be overriden later on if we discover we don't support the right shader features.
    //this.analysisType = ANALYSISTYPE_WAVEFORM;

    this.freqByteData = 0;
    this.texture = 0;
    this.TEXTURE_HEIGHT = 256;
    this.yoffset = 0;

    this.waveformShader = 0;

    // Background color
    this.backgroundColor = [1, 1, 1, 1];

    // Foreground color
    this.foregroundColor = [78.0 / 255.0,
                           165.0 / 255.0,
                           255.0 / 255.0,
                           1.0];
    this.initGL();
}


AnalyserView.prototype.initGL = function() {
    
    var backgroundColor = this.backgroundColor;

    var canvas = this.canvasElement;
    this.canvas = canvas;
    
    var gl = canvas.getContext("experimental-webgl");
    this.gl = gl;
    
    gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
    gl.enable(gl.DEPTH_TEST);

    // Initialization for the 2D visualizations
    var vertices = new Float32Array([
        1.0,  1.0, 0.0,
        -1.0,  1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0,  1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0]);
    var texCoords = new Float32Array([
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0]);

    var vboTexCoordOffset = vertices.byteLength;
    this.vboTexCoordOffset = vboTexCoordOffset;

    // Create the vertices and texture coordinates
    var vbo = gl.createBuffer();
    this.vbo = vbo;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER,
        vboTexCoordOffset + texCoords.byteLength,
        gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vboTexCoordOffset, texCoords);

    // Load the shaders
    o3djs.shader.asyncLoadFromURL(gl, "shaders/common-vertex.shader", "shaders/waveform-fragment.shader",
        function( shader ) {this.waveformShader = shader; }.bind(this));

}

AnalyserView.prototype.initByteBuffer = function( analyser ) {
    var gl = this.gl;
    var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT;
    
    if (!this.freqByteData || this.freqByteData.length != analyser.frequencyBinCount) {
        freqByteData = new Uint8Array(analyser.frequencyBinCount);
        this.freqByteData = freqByteData;
        
        // (Re-)Allocate the texture object
        if (this.texture) {
            gl.deleteTexture(this.texture);
            this.texture = null;
        }
        var texture = gl.createTexture();
        this.texture = texture;
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // TODO(kbr): WebGL needs to properly clear out the texture when null is specified
        var tmp = new Uint8Array(freqByteData.length * TEXTURE_HEIGHT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, freqByteData.length, TEXTURE_HEIGHT, 0, gl.ALPHA, gl.UNSIGNED_BYTE, tmp);
    }
}

AnalyserView.prototype.doFrequencyAnalysis = function( analyser ) {
    var freqByteData = this.freqByteData;

    analyser.smoothingTimeConstant = 0.1;
    analyser.getByteTimeDomainData(freqByteData);
  
    this.drawGL();
}


AnalyserView.prototype.drawGL = function() {
    var gl = this.gl;
    var vbo = this.vbo;
    var vboTexCoordOffset = this.vboTexCoordOffset;
    var freqByteData = this.freqByteData;
    var texture = this.texture;
    var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT;
    
    var waveformShader = this.waveformShader;
    if (!waveformShader) return;
        
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, this.yoffset, freqByteData.length, 1, gl.ALPHA, gl.UNSIGNED_BYTE, freqByteData);

    // Point the frequency data texture at texture unit 0 (the default),
    // which is what we're using since we haven't called activeTexture
    // in our program

    var vertexLoc;
    var texCoordLoc;
    var frequencyDataLoc;
    var foregroundColorLoc;
    var backgroundColorLoc;
    var texCoordOffset;

    var currentShader;

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    currentShader = waveformShader;
    currentShader.bind();
    vertexLoc = currentShader.gPositionLoc;
    texCoordLoc = currentShader.gTexCoord0Loc;
    frequencyDataLoc = currentShader.frequencyDataLoc;
    foregroundColorLoc = currentShader.foregroundColorLoc;
    backgroundColorLoc = currentShader.backgroundColorLoc;
    gl.uniform1f(currentShader.yoffsetLoc, 0.5 / (TEXTURE_HEIGHT - 1));
    texCoordOffset = vboTexCoordOffset;

    if (frequencyDataLoc) {
        gl.uniform1i(frequencyDataLoc, 0);
    }
    if (foregroundColorLoc) {
        gl.uniform4fv(foregroundColorLoc, this.foregroundColor);
    }
    if (backgroundColorLoc) {
        gl.uniform4fv(backgroundColorLoc, this.backgroundColor);
    }

    // Set up the vertex attribute arrays
    gl.enableVertexAttribArray(vertexLoc);
    gl.vertexAttribPointer(vertexLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, gl.FALSE, 0, texCoordOffset);

    // Clear the render area
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Actually draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Disable the attribute arrays for cleanliness
    gl.disableVertexAttribArray(vertexLoc);
    gl.disableVertexAttribArray(texCoordLoc);
}

