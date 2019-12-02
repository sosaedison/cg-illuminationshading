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
    // I = (I_a * K_a) + (I_p * K_d) (N_norm * L_norm) + (I_p * K_s) (R_norm * V_norm)^n
    //    [   ambient  ] [         diffuse          ]   [            specular          ]
    
    //vector from fragment location
    // vec3 to_light = light_position - vertex_normal;
    // to_light = glMatrix.vec3.normalize(to_light);
    // vec3 V_normal = glMatrix.vec3.normalize(vertex_normal);

    // vec3 to_camera = -1.0 * camera_position
    // vec3 reflection = 2.0 * glMatrix.vec3.dot(vertex_normal, to_light) * vertex_normal - to_light;
    // vec3 R_norm = glMatrix.vec3.normalize(reflection);
    
    float ambient_strength = 0.1;
    ambient = light_ambient * ambient_strength; // I think this is is I_a
    
    vec3 surface_normal = normalize(vertex_normal);
    vec3 direction_to_light = light_position - vertex_normal;
    diffuse = (light_position *  dot( surface_normal, direction_to_light )); // I think this is I_p without k_d

    vec3 norm_relfected_light_direction = 2.0 * ((dot(surface_normal, -light_position))* (( surface_normal ) - ( -light_position )));
    vec3 normalized_view_direction = normalize(camera_position);
    specular = light_position * pow(dot(norm_relfected_light_direction, normalized_view_direction), material_shininess); // I think this is I_p without K_s
    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(vertex_position, 1.0);
}
