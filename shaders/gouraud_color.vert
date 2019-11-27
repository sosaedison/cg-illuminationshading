#version 300 es

precision highp float;

in vec3 vertex_position;
in vec3 vertex_normal;

uniform vec3 light_ambient;
uniform vec3 light_position;
uniform vec3 light_color;
uniform vec3 camera_position;
uniform float material_shininess; // n
uniform mat4 model_matrix;
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec3 ambient;
out vec3 diffuse;
out vec3 specular;

void main() {
    // we have to do the main calculations here
    // I = (I_a * K_a) + (I_p * K_d) (N_norm * L_norm) + (I_p * K_s) (R_norm * V_norm)
    //    [   ambient  ] [         diffuse          ]   [            specular          ]
    ambient = light_ambient;
    specular = light_position;


    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(vertex_position, 1.0);
}
