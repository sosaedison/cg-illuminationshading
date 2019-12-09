#version 300 es

precision mediump float;

in vec3 frag_pos;
in vec3 frag_normal;
in vec2 frag_texcoord;

uniform vec3 light_ambient;
uniform int num_lights;
uniform vec3 light_position[10];
uniform vec3 light_color[10];
uniform vec3 camera_position;
uniform vec3 material_color;      // Ka and Kd
uniform vec3 material_specular;   // Ks
uniform float material_shininess; // n
uniform sampler2D image;          // use in conjunction with Ka and Kd

out vec4 FragColor;

void main() {
    vec3 final_mat_color = texture(image, frag_texcoord).rgb * material_color;
    vec3 ambient = light_ambient * final_mat_color;
    vec3 N = normalize(frag_normal);
    vec3 diffuse = vec3(0.0, 0.0, 0.0);
    vec3 specular = vec3(0.0, 0.0, 0.0);
    vec3 V = normalize(camera_position - frag_pos);
    for(int i = 0; i < num_lights; i++) {
        vec3 L = normalize(light_position[i] - frag_pos);
        vec3 R = (2.0 * (clamp(dot(N, L), 0.0, 1.0) * N) - L);   
        diffuse += light_color[i] * final_mat_color * clamp(dot(N , L), 0.0,1.0);
        specular += light_color[i] * material_specular * (pow(clamp(dot(R, V), 0.0, 1.0), material_shininess));
    }
    diffuse = clamp(diffuse, 0.0, 1.0);
    specular = clamp(specular, 0.0, 1.0);
    FragColor = vec4(ambient + diffuse + specular, 1.0) * texture(image, frag_texcoord);
}
