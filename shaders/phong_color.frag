#version 300 es

precision mediump float;

in vec3 frag_pos;
in vec3 frag_normal;

uniform vec3 light_ambient;
uniform vec3 light_position;
uniform vec3 light_color;
uniform vec3 camera_position;
uniform vec3 material_color;      // Ka and Kd
uniform vec3 material_specular;   // Ks
uniform float material_shininess; // n

out vec4 FragColor;

void main() {
    
    vec3 ambient = light_ambient;
    
    vec3 direction_to_light = normalize(camera_position - light_position);
    vec3 diffuse_color = (light_color *  dot( norm, direction_to_light ));
    float diffuse_calc = clamp(dot(direction_to_light, diffuse_color), 0, 1);
    vec3 diiffuse = diffuse_color * diffuse_calc;

    
    vec3 specular;


    vec3 result;
    FragColor = vec4(material_color, 1.0);
}
