#version 300 es

precision highp float;

in vec3 vertex_position;
in vec3 vertex_normal;

uniform mat4 model_matrix;
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec3 frag_pos;
out vec3 frag_normal;

void main() {
<<<<<<< Updated upstream
=======
    vec4 vertPos4 = model_matrix * vec4(vertex_position, 1.0);
    frag_pos = vec3(vertPos4) / vertPos4.w;
    mat3 norm_matrix = inverse(transpose(mat3(model_matrix)));
    frag_normal = normalize(norm_matrix * vertex_normal);
>>>>>>> Stashed changes
    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(vertex_position, 1.0);
}