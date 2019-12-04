#version 300 es

precision mediump float;

in vec3 ambient;
in vec3 diffuse;
in vec3 specular;
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
    vec3 coord = texture(image, frag_texcoord); 
    vec3 
    vec3 N = normalize()
    vec3 L = normalize(light_position - coord);
    vec3 ambient = light_ambient * final_mat_color;
    vec3 diffuse = light_color * final_mat_color

    FragColor = vec4(material_color, 1.0) * texture(image, frag_texcoord);
}
