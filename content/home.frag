#version 300 es

/*
Linkin 20v vujut otsikkovarjostin
author: Vili Kärkkäinen
*/

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_background_color;

out vec4 outColor;

#define PI 3.1415926538

struct surface {
    float sdv;
    float spec;
    vec3 col;
};

const float EPSILON = 0.01;
const float TIMESCALE = 0.2;
const float CAMERA_ANGLE = PI / 16.0 * 1.5;
const vec3 PACMAN_COLOR = vec3(0.9);
vec3 cp;
vec3 lp;
vec2 uv;

mat2 rotate(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);  
}

surface unionCSG(surface s1, surface s2) {
    if (s1.sdv < s2.sdv) return s1;
    return s2;
}
surface differenceCSG(surface s1, surface s2) {
    if (s1.sdv > -s2.sdv) return s1;
    return surface(-s2.sdv, s2.spec, s2.col);
}
surface intersectionCSG(surface s1, surface s2) {
    if (s1.sdv > s2.sdv) return s1;
    return s2;
}

surface boxSDF(vec3 p, vec3 d, float spec, vec3 col) {
    vec3 q = abs(p) - d;
    float val = length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    return surface(val, spec, col);
}

surface roundBoxSDF(vec3 p, vec3 b, float r, float spec, vec3 col){
    vec3 q = abs(p) - b + r;
    float d = length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
    return surface(d, spec, col);
}

surface inficylinderSDF(vec3 p, vec3 c, float spec, vec3 col) {
    float d = length(p.xz - c.xy) - c.z;
    return surface(d, spec, col);
}

surface coneSDF(vec3 p, vec2 c, float h, float spec, vec3 col) {
    float q = length(p.xz);
    float d = max(dot(c.xy, vec2(q,p.y)),-h-p.y);
    return surface(d, spec, col);
}

surface planeSDF(vec3 p, vec3 n, float h, float spec, vec3 col) {
    float d = dot(p, n) + h;
    return surface(d, spec, col);
}

surface sphereSDF(vec3 p, float r, float spec, vec3 col) {
    float d = length(p) - r;
    return surface(d, spec, col);
}

surface pacmanSDF(vec3 p, float r, float xz_rotate, float spec, vec3 col, float skol) {
    vec3 pn = p;
    pn.xz *= rotate(xz_rotate);
    p.xz *= rotate(xz_rotate);
    pn.xy *= rotate(PI / 4.0);
    /*
    return unionCSG(
        unionCSG(
            differenceCSG(
                sphereSDF(pn, r, spec, col),
                boxSDF(pn - vec3(0.5, 0.5, 0.0), vec3(0.5, 0.5, 1.5), spec, col)
            ),
            sphereSDF(
                pn - vec3(0.5, 0.5, 0.0),
                r/4.0, spec, col
            )
        ), boxSDF(p - vec3(0.8, skol, 0.8), vec3(0.1, 0.2, 0.1), 1.0, vec3(0.3, 0.3, 1.0))
    );
    */
    return unionCSG(
        differenceCSG(
            sphereSDF(pn, r, spec, col),
            boxSDF(pn - vec3(0.5, 0.5, 0.0), vec3(0.5, 0.5, 1.5), spec, col)
        ),
        sphereSDF(
            pn - vec3(0.5, 0.5, 0.0),
            r/4.0, spec, col
        )
    );
}

vec3 repeat(vec3 p, vec3 c) {
    return mod(p, c) - 0.5*c;
}

surface map(vec3 p) {
    p -= vec3(0.0, -0.4, 0.0);
    p.yz *= rotate(CAMERA_ANGLE);
    vec3 pt = repeat(p - vec3(-u_time * TIMESCALE, 0.0, 0.0), vec3(2.7, 0.0, 0.0));
    vec3 pl = repeat(p - vec3(-u_time * TIMESCALE, 0.0, 7.0), vec3(8.0, 0.0, 0.0));
    float r = 0.9;
    float spec = 0.5;
    /*
    float angle = 0.25 * (min(0.01, 3.0*sin(u_time) + 0.75) + max(0.01, 3.0*sin(u_time + PI/2.0)-0.75));
    float skol = abs(sin(u_time + 3.0*PI/4.0));
    */
    float angle = 0.0;
    float skol = 0.0;
    vec3 pacman_color = PACMAN_COLOR;
    // Room for improvement: bounding boxes/spheres for pacmen?
    return unionCSG(
        unionCSG(
            unionCSG(
                unionCSG(
                    pacmanSDF(pt - vec3(0.0, 0.0, 0.0), r, 3.0*PI/2.0 + angle, spec, pacman_color, skol),
                    pacmanSDF(pt - vec3(0.0, 0.0, 5.0), r, PI/2.0 + angle, spec, pacman_color, skol)
                ),
                roundBoxSDF(pt - vec3(0.0, -1.5, 2.5), vec3(1.5, 1.0, 1.6), 0.2, 0.0, vec3(1.0))
            ),
            inficylinderSDF(pl, vec3(1.0), 0.0, vec3(0.89, 0.87, 0.80))
        ),
        planeSDF(p - vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), 1.0, 0.2, vec3(0.0, 0.7, 0.5))
    );
}

vec3 calcNormal(vec3 p) {
    vec2 epvec = vec2(EPSILON, 0.0);
    return normalize(vec3(map(p + epvec.xyy).sdv - map(p - epvec.xyy).sdv, 
                          map(p + epvec.yxy).sdv - map(p - epvec.yxy).sdv,
                          map(p + epvec.yyx).sdv - map(p - epvec.yyx).sdv));
}

const vec3 lightColor = vec3(1.0f, 1.0f, 1.0f);
const float ambientStrength = 0.05;
const vec3 ambientColor = lightColor * ambientStrength;

vec3 calcShading(vec3 p, vec3 n, surface item) {
  
    vec3 dtl = normalize(lp - p);
    vec3 diff = max(dot(n, dtl), 0.f) * lightColor * item.col;
    
    vec3 dtc = normalize(cp - p);
    vec3 ref = normalize(reflect(-dtl, n));
    vec3 spec = pow(max(dot(dtc, ref), 0.0), 32.0) * lightColor * item.spec;
    
    return item.col * (diff + ambientColor + spec);
  
}

/* 
When there's no hits, we do this. We could do something more fancy than
returning a solid color...
*/
vec3 nohit_col() {
    return u_background_color.rgb;
}


vec3 raymarch(vec3 ro, vec3 rd) {
    float MAXDIST = 25.0 * (1.0 + abs(uv.x/6.0));
    const int MAXSTEPS = 200;
    
    float dist = 0.0f;
    
    for (int i = 0; i < MAXSTEPS; ++i) {
      
        vec3 p = ro + dist * rd;

        surface item = map(p);
        float d = item.sdv;
        
        if (d < EPSILON) {
            vec3 normal = calcNormal(p);
            return calcShading(p, normal, item);
        }
        
        if (dist > MAXDIST) break;
        
        dist += d;
      
    }
    // No hit, return something
    return nohit_col();
}


void main() {
    uv = gl_FragCoord.xy/u_resolution.xy - vec2(0.5);
    uv /= 3.0;
    cp = vec3(0.0, 0.0, -8.0);
    lp = cp + vec3(0.0, 2.0, 0.0);
    float ar = u_resolution.x/u_resolution.y;
    uv.x *= ar;

    vec3 screen = vec3(uv, cp.z + 1.0);
    vec3 raydir = normalize(screen - cp);
    vec3 marchresult = raymarch(cp, raydir);

    outColor = vec4(marchresult, 1.0);
}
