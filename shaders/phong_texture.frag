#version 300 es

precision mediump float;

in vec3 frag_pos;
in vec3 frag_normal;
in vec2 frag_texcoord;

uniform vec3 light_ambient;
uniform vec3 light_position;
uniform vec3 light_color;
uniform vec3 camera_position;
uniform vec3 material_color;      // Ka and Kd
uniform vec3 material_specular;   // Ks
uniform float material_shininess; // n
uniform sampler2D image;          // use in conjunction with Ka and Kd

out vec4 FragColor;

void main() {
    vec3 final_mat_color = texture(image, frag_texcoord).rgb * material_color;

    //not sure if N L R V are right not sure what to put to normalize
    vec3 N = normalize(frag_normal);

    //not sure if this is right
    vec3 L = normalize(light_position - frag_pos);
    vec3 R = (2.0 * (clamp(dot(N, L), 0.0, 1.0) * N) - L);
    vec3 V = normalize(camera_position - frag_pos);
    vec3 ambient = light_ambient * final_mat_color;
    vec3 diffuse = light_color * final_mat_color * clamp(dot(N , L), 0.0,1.0);
    vec3 specular  = light_color * material_specular * (pow(clamp(dot(R, V), 0.0, 1.0), material_shininess));

    FragColor = vec4(material_color, 1.0) * texture(image, frag_texcoord);
}
