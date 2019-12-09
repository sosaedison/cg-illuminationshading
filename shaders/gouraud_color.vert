#version 300 es

precision highp float;

in vec3 vertex_position;
in vec3 vertex_normal;

uniform vec3 light_ambient;
uniform int num_lights;
uniform vec3 light_position[10];
uniform vec3 light_color[10];
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
    // I = (I_a * K_a) + (I_p * K_d) (N_norm * L_norm) + (I_p * K_s) (R_norm * V_norm)^n
    //    [   ambient  ] [         diffuse          ]   [            specular          ]

    ambient = light_ambient;
    vec4 pos = model_matrix * vec4(vertex_position, 1.0);
    mat3 norm_matrix = inverse(transpose(mat3(model_matrix)));
    vec3 norm = normalize(norm_matrix * vertex_normal);
    vec3 normalized_view_direction = normalize(camera_position - pos.xyz);
    diffuse = vec3(0.0, 0.0, 0.0);
    specular = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < num_lights; i++){
        vec3 direction_to_light = normalize(light_position[i] - pos.xyz);
        diffuse += (light_color[i] *  clamp(dot( norm, direction_to_light ), 0.0, 1.0));
        vec3 norm_relfected_light_direction = normalize(clamp( 2.0 * dot(norm, direction_to_light) * norm - direction_to_light , 0.0 , 1.0 ));
        specular += light_color[i] * pow(clamp(dot(norm_relfected_light_direction, normalized_view_direction), 0.0, 1.0), material_shininess); // I think this is I_p without K_s
    }
    diffuse = clamp(diffuse, 0.0, 1.0);
    specular = clamp(specular, 0.0, 1.0);
    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(vertex_position, 1.0);
}
