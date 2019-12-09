#version 300 es

precision highp float;

in vec3 vertex_position;
in vec3 vertex_normal;
in vec2 vertex_texcoord;

uniform vec3 light_ambient;
uniform int num_lights;
uniform vec3 light_position[10];
uniform vec3 light_color[10];
uniform vec3 camera_position;
uniform float material_shininess;
uniform vec2 texture_scale;
uniform mat4 model_matrix;
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec3 ambient;
out vec3 diffuse;
out vec3 specular;
out vec2 frag_texcoord;

void main() {

    ambient = light_ambient;
    vec4 pos = model_matrix * vec4(vertex_position, 1.0);
    mat3 norm_matrix = inverse(transpose(mat3(model_matrix)));
    vec3 N = normalize(norm_matrix * vertex_normal);
    diffuse = vec3(0.0, 0.0, 0.0);
    specular = vec3(0.0, 0.0, 0.0);
    for(int i = 0; i < num_lights; i++) {
        vec3 L = normalize (light_position[i] - pos.xyz);
        diffuse += (light_color[i] * clamp(dot(N, L), 0.0, 1.0));
        vec3 R = normalize(clamp(2.0 * dot(N, L) * N - L, 0.0, 1.0));
        vec3 V = normalize(camera_position - pos.xyz);
        specular += light_color[i] * pow(clamp(dot(R, V), 0.0, 1.0), material_shininess);
    }
    diffuse = clamp(diffuse, 0.0, 1.0);
    specular = clamp(specular, 0.0, 1.0);
    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(vertex_position, 1.0);
    frag_texcoord = vertex_texcoord * texture_scale;
}
