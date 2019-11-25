class GlApp {
    constructor(canvas_id, width, height, scene) {
        this.canvas = document.getElementById(canvas_id);
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            alert('Unable to initialize WebGL 2. Your browser may not support it.');
        }
        //his  
        //hers
        this.scene = scene;
        //user selected shaded algo
        //from broswer drop down menu
        this.algorithm = 'gouraud'
        //list of shaders this depends on the algorithm
        this.shader = {gouraud_color: null, gouraud_texture: null,
                       phong_color: null,   phong_texture: null};
        this.vertex_position_attrib = 0;
        this.vertex_normal_attrib = 1;
        this.vertex_texcoord_attrib = 2;

        this.projection_matrix = glMatrix.mat4.create(); // project to 2D cause we can't draw 3D
        this.view_matrix = glMatrix.mat4.create(); // defines where the camera is and transforms the camera to that position
        this.model_matrix = glMatrix.mat4.create(); // transforms model to the correct locaition in the scene
        //one vertex array for each, has positions, normals, and texcoord
        this.vertex_array = {plane: null, cube: null, sphere: null};

        let gouraud_color_vs = this.GetFile('shaders/gouraud_color.vert');
        let gouraud_color_fs = this.GetFile('shaders/gouraud_color.frag');
        let gouraud_texture_vs = this.GetFile('shaders/gouraud_texture.vert');
        let gouraud_texture_fs = this.GetFile('shaders/gouraud_texture.frag');
        let phong_color_vs = this.GetFile('shaders/phong_color.vert');
        let phong_color_fs = this.GetFile('shaders/phong_color.frag');
        let phong_texture_vs = this.GetFile('shaders/phong_texture.vert');
        let phong_texture_fs = this.GetFile('shaders/phong_texture.frag');
        let emissive_vs = this.GetFile('shaders/emissive.vert');
        let emissive_fs = this.GetFile('shaders/emissive.frag');

        Promise.all([gouraud_color_vs, gouraud_color_fs, gouraud_texture_vs, gouraud_texture_fs,
                     phong_color_vs, phong_color_fs, phong_texture_vs, phong_texture_fs,
                     emissive_vs, emissive_fs])
        .then((shaders) => this.LoadShaders(shaders))
        .catch((error) => this.GetFileError(error));
    }

    InitializeGlApp() {
        //Draw scene to the canvas
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST); // Drawing with the z buffer so things layer properly

        //Creates vertex array 
        this.vertex_array.plane = CreatePlaneVao(this);
        this.vertex_array.cube = CreateCubeVao(this);
        this.vertex_array.sphere = CreateSphereVao(this);

        let fov = 45.0 * (Math.PI / 180.0);
        let aspect = this.canvas.width / this.canvas.height;
        glMatrix.mat4.perspective(this.projection_matrix, fov, aspect, 1.0, 50.0);
        
        let cam_pos = this.scene.camera.position;
        let cam_target = glMatrix.vec3.create();
        let cam_up = this.scene.camera.up;
        glMatrix.vec3.add(cam_target, cam_pos, this.scene.camera.direction);
        glMatrix.mat4.lookAt(this.view_matrix, cam_pos, cam_target, cam_up); // Setting view matrix -- sets vrp and vpn

        this.Render();
    }

    InitializeTexture(image_url) {
        // create a texture, and upload a temporary 1px white RGBA array [255,255,255,255]
        let texture;

        // load the actual image
        let image = new Image();
        image.crossOrigin = 'anonymous';
        image.addEventListener('load', (event) => {
            this.UpdateTexture(texture, image);
        }, false);
        image.src = image_url;
    }

    UpdateTexture(texture, image_element) {

    }

    Render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // clear everything
        
        // draw all models --> note you need to properly select shader here
        for (let i = 0; i < this.scene.models.length; i ++) {
            //create a string with a combination of the algorithm and models shader type, for example gouraud color or text
            // this will replace all emissive with scene.models.shader
            var shaderType = this.algorithm + '_' + this.scene.models[0].shader;
            this.gl.useProgram(this.shader[shaderType].program); // this is where we select shader type

            // This is how we're transforming the model
                // Could be a translate or rotate or scale for each model
            glMatrix.mat4.identity(this.model_matrix);
            glMatrix.mat4.translate(this.model_matrix, this.model_matrix, this.scene.models[i].center);
            glMatrix.mat4.scale(this.model_matrix, this.model_matrix, this.scene.models[i].size);
            
            // alot more of this as we need more info about lights and all like changing the proj_matrix and uniform material. Dont
            //change these but we need to add. 
            this.gl.uniform3fv(this.shader[shaderType].uniform.material, this.scene.models[i].material.color); // uploading vector3 to graphics card
            this.gl.uniformMatrix4fv(this.shader[shaderType].uniform.projection, false, this.projection_matrix); // vector4 matrix for view, model and projection
            this.gl.uniformMatrix4fv(this.shader[shaderType].uniform.view, false, this.view_matrix);  // (shader handle, transpose? 16 values for 4x4 matrix) -> this goes to the shader
            this.gl.uniformMatrix4fv(this.shader[shaderType].uniform.model, false, this.model_matrix);
            //this.scene..... from html
            //this.gl.uniform3fv(this.shader[shaderType].uniform.light_ambient, this.something);
            //this.gl.uniform3fv(this.shader[shaderType].uniform.light_pos, false, this.something); NOT SURE IF VEX OR MATRIX
            this.gl.uniform3fv(this.shader[shaderType].uniform.light_ambient, this.scene.light.ambient);
            this.gl.uniform3fv(this.shader[shaderType].uniform.light_pos, false, this.scene.light.point_lights[0].position);
            //this.gl.uniform3fv(this.shader[shaderType].uniform.light_col,this.something);
            //this.gl.uniform3fv(this.shader[shaderType].uniform.camera_pos, this.something);
            //this.gl.uniform3fv(this.shader[shaderType].uniform.material_col, this.something);
            //this.gl.uniform3fv(this.shader[shaderType].uniform.material_spec, this.something);
            //this.gl.uniform3fv(this.shader[shaderType].uniform.shininess, this.something);

            console.log(this.shader[shaderType].uniform.model);


            this.gl.bindVertexArray(this.vertex_array[this.scene.models[i].type]); // bind the one we're about to draw
            this.gl.drawElements(this.gl.TRIANGLES, this.vertex_array[this.scene.models[i].type].face_index_count, this.gl.UNSIGNED_SHORT, 0);
            this.gl.bindVertexArray(null);
        }

        // draw all light sources
        for (let i = 0; i < this.scene.light.point_lights.length; i ++) {
            this.gl.useProgram(this.shader['emissive'].program);

            glMatrix.mat4.identity(this.model_matrix);
            glMatrix.mat4.translate(this.model_matrix, this.model_matrix, this.scene.light.point_lights[i].position);
            glMatrix.mat4.scale(this.model_matrix, this.model_matrix, glMatrix.vec3.fromValues(0.1, 0.1, 0.1));


            this.gl.uniform3fv(this.shader['emissive'].uniform.material, this.scene.light.point_lights[i].color); 
            this.gl.uniformMatrix4fv(this.shader['emissive'].uniform.projection, false, this.projection_matrix);
            this.gl.uniformMatrix4fv(this.shader['emissive'].uniform.view, false, this.view_matrix);
            this.gl.uniformMatrix4fv(this.shader['emissive'].uniform.model, false, this.model_matrix);

            this.gl.bindVertexArray(this.vertex_array['sphere']);
            this.gl.drawElements(this.gl.TRIANGLES, this.vertex_array['sphere'].face_index_count, this.gl.UNSIGNED_SHORT, 0);
            this.gl.bindVertexArray(null);
        }
    }

    UpdateScene(scene) {
        this.scene = scene;
        
        let cam_pos = this.scene.camera.position;
        let cam_target = glMatrix.vec3.create();
        let cam_up = this.scene.camera.up;
        glMatrix.vec3.add(cam_target, cam_pos, this.scene.camera.direction);
        glMatrix.mat4.lookAt(this.view_matrix, cam_pos, cam_target, cam_up);

        this.Render();
    }

    SetShadingAlgorithm(algorithm) {
        this.algorithm = algorithm;
        this.Render();
    }

    GetFile(url) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    resolve(req.response);
                }
                else if (req.readyState === 4) {
                    reject({url: req.responseURL, status: req.status});
                }
            };
            req.open('GET', url, true);
            req.send();
        });
    }

    GetFileError(error) {
        console.log('Error:', error);
    }

    LoadShaders(shaders) {
        this.LoadColorShader(shaders[0], shaders[1], 'gouraud_color');
        this.LoadTextureShader(shaders[2], shaders[3], 'gouraud_texture');
        this.LoadColorShader(shaders[4], shaders[5], 'phong_color');
        this.LoadTextureShader(shaders[6], shaders[7], 'phong_texture');
        this.LoadEmissiveShader(shaders[8], shaders[9], 'emissive');

        this.InitializeGlApp();
    }

    LoadColorShader(vs_source, fs_source, program_name) {
        let vertex_shader = this.CompileShader(vs_source, this.gl.VERTEX_SHADER);
        let fragment_shader = this.CompileShader(fs_source, this.gl.FRAGMENT_SHADER);

        let program = this.CreateShaderProgram(vertex_shader, fragment_shader);

        this.gl.bindAttribLocation(program, this.vertex_position_attrib, 'vertex_position');
        this.gl.bindAttribLocation(program, this.vertex_normal_attrib, 'vertex_normal');
        this.gl.bindAttribLocation(program, 0, 'FragColor');

        this.LinkShaderProgram(program);


        //we already used some of these but we have to ust them all like shininess projection and all that up there 
        //These are references to the things that are running on the graphics card
        let light_ambient_uniform = this.gl.getUniformLocation(program, 'light_ambient');
		let light_pos_uniform = this.gl.getUniformLocation(program, 'light_position');
        let light_col_uniform = this.gl.getUniformLocation(program, 'light_color');
        let camera_pos_uniform = this.gl.getUniformLocation(program, 'camera_position');
        let material_col_uniform = this.gl.getUniformLocation(program, 'material_color');
        let material_spec_uniform = this.gl.getUniformLocation(program, 'material_specular');
        let shininess_uniform = this.gl.getUniformLocation(program, 'material_shininess');
        let projection_uniform = this.gl.getUniformLocation(program, 'projection_matrix');
        let view_uniform = this.gl.getUniformLocation(program, 'view_matrix');
        let model_uniform = this.gl.getUniformLocation(program, 'model_matrix');

        this.shader[program_name] = {
            program: program,
            uniform: {
				light_ambient: light_ambient_uniform,
                light_pos: light_pos_uniform,
                light_col: light_col_uniform,
                camera_pos: camera_pos_uniform,
                material_col: material_col_uniform,
                material_spec: material_spec_uniform,
                shininess: shininess_uniform,
                projection: projection_uniform,
                view: view_uniform,
                model: model_uniform
            }
        };
    }

    LoadTextureShader(vs_source, fs_source, program_name) {
        let vertex_shader = this.CompileShader(vs_source, this.gl.VERTEX_SHADER);
        let fragment_shader = this.CompileShader(fs_source, this.gl.FRAGMENT_SHADER);

        let program = this.CreateShaderProgram(vertex_shader, fragment_shader);

        this.gl.bindAttribLocation(program, this.vertex_position_attrib, 'vertex_position');
        this.gl.bindAttribLocation(program, this.vertex_normal_attrib, 'vertex_normal');
        this.gl.bindAttribLocation(program, this.vertex_texcoord_attrib, 'vertex_texcoord');
        this.gl.bindAttribLocation(program, 0, 'FragColor');

        this.LinkShaderProgram(program);

        //we already used some of these so we gotta use all of them 
		let light_ambient_uniform = this.gl.getUniformLocation(program, 'light_ambient');
        let light_pos_uniform = this.gl.getUniformLocation(program, 'light_position');
        let light_col_uniform = this.gl.getUniformLocation(program, 'light_color');
        let camera_pos_uniform = this.gl.getUniformLocation(program, 'camera_position');
        let material_col_uniform = this.gl.getUniformLocation(program, 'material_color');
        let material_spec_uniform = this.gl.getUniformLocation(program, 'material_specular');
        let tex_scale_uniform = this.gl.getUniformLocation(program, 'texture_scale');
        let image_uniform = this.gl.getUniformLocation(program, 'image');
        let shininess_uniform = this.gl.getUniformLocation(program, 'material_shininess');
        let projection_uniform = this.gl.getUniformLocation(program, 'projection_matrix');
        let view_uniform = this.gl.getUniformLocation(program, 'view_matrix');
        let model_uniform = this.gl.getUniformLocation(program, 'model_matrix');

        this.shader[program_name] = {
            program: program,
            uniform: {
				light_ambient: light_ambient_uniform,
                light_pos: light_pos_uniform,
                light_col: light_col_uniform,
                camera_pos: camera_pos_uniform,
                material_col: material_col_uniform,
                material_spec: material_spec_uniform,
                tex_scale: tex_scale_uniform,
                image: image_uniform,
                shininess: shininess_uniform,
                projection: projection_uniform,
                view: view_uniform,
                model: model_uniform
            }
        };
    }

    LoadEmissiveShader(vs_source, fs_source, program_name) {
        let vertex_shader = this.CompileShader(vs_source, this.gl.VERTEX_SHADER);
        let fragment_shader = this.CompileShader(fs_source, this.gl.FRAGMENT_SHADER);

        let program = this.CreateShaderProgram(vertex_shader, fragment_shader);

        this.gl.bindAttribLocation(program, this.vertex_position_attrib, 'vertex_position');
        this.gl.bindAttribLocation(program, 0, 'FragColor');

        this.LinkShaderProgram(program);

        let material_uniform = this.gl.getUniformLocation(program, 'material_color');
        let projection_uniform = this.gl.getUniformLocation(program, 'projection_matrix');
        let view_uniform = this.gl.getUniformLocation(program, 'view_matrix');
        let model_uniform = this.gl.getUniformLocation(program, 'model_matrix');

        this.shader[program_name] = {
            program: program,
            uniform: {
                material: material_uniform,
                projection: projection_uniform,
                view: view_uniform,
                model: model_uniform
            }
        };
    }

    CompileShader(source, type) {
        // Create a shader object
        let shader = this.gl.createShader(type);

        // Send the source to the shader object
        this.gl.shaderSource(shader, source);

        // Compile the shader program
        this.gl.compileShader(shader);

        // Check to see if it compiled successfully
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shader: ' + this.gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    CreateShaderProgram(vertex_shader, fragment_shader) {
        let program = this.gl.createProgram();
        this.gl.attachShader(program, vertex_shader);
        this.gl.attachShader(program, fragment_shader);

        return program;
    }

    LinkShaderProgram(program) {
        this.gl.linkProgram(program);

        // Check to see if it linked successfully
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            alert('An error occurred linking the shader program.');
        }
    }
}
