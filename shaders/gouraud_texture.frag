#version 300 es

precision mediump float;

in vec3 ambient;
in vec3 diffuse;
in vec3 specular;
in vec2 frag_texcoord;

uniform vec3 material_color;    // Ka and Kd
uniform vec3 material_specular; // Ks
uniform sampler2D image;        // use in conjunction with Ka and Kd

out vec4 FragColor;

void main() {
    vec3 final_mat_color = texture(image, frag_texcoord).rgb * material_color;
    
    vec3 hi = ( ambient * final_mat_color ) + ( diffuse * final_mat_color ) + ( specular * material_specular );
    FragColor = vec4(hi, 1.0);
    
}
