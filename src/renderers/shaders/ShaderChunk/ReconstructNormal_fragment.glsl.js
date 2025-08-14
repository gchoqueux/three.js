export default /* glsl */`
void camera( out vec3 ro, out vec3 rd, in float time, in vec2 p)
{
    // screen split
    p.x -= sign(p.x)*1.77777*0.5;

    // camera position and target
    ro = vec3(0.5, 0.3, 0.5 );
    vec3 ta = ro + vec3( -1.0, 0.0, -1.0 );

    // contruct ray
    vec3 cw = normalize( ta-ro );
    vec3 cp = vec3( 0.0, 1.0, 0.0 );
    vec3 cu = normalize( cross(cw,cp) );
    vec3 cv = normalize( cross(cu,cw) );
    rd = normalize( p.x*cu + p.y*cv + 1.8*cw );
}

// compute the world space position of a pixel with coordinates
// fragCoord and distance "depth" to camera. This will need to
// change depending on wether your depth buffer stores "depth"
// "z", "reverse z", etc
vec3 getPos( in ivec2 fragCoord, in float depth )
{
    vec2 p = (2.0*vec2(fragCoord)-iResolution.xy)/iResolution.y;
    vec3 ro, rd;
    camera( ro, rd, iTime, p );
    return depth*rd;
}

// computes the normal at pixel "p" based on the deph buffer "depth"
vec3 computeNormalImproved( const sampler2D depth, in ivec2 p )
{
    float c0 = texelFetch(depth,p           ,0).w;
    float l2 = texelFetch(depth,p-ivec2(2,0),0).w;
    float l1 = texelFetch(depth,p-ivec2(1,0),0).w;
    float r1 = texelFetch(depth,p+ivec2(1,0),0).w;
    float r2 = texelFetch(depth,p+ivec2(2,0),0).w;
    float b2 = texelFetch(depth,p-ivec2(0,2),0).w;
    float b1 = texelFetch(depth,p-ivec2(0,1),0).w;
    float t1 = texelFetch(depth,p+ivec2(0,1),0).w;
    float t2 = texelFetch(depth,p+ivec2(0,2),0).w;

    float dl = abs(l1*l2/(2.0*l2-l1)-c0);
    float dr = abs(r1*r2/(2.0*r2-r1)-c0);
    float db = abs(b1*b2/(2.0*b2-b1)-c0);
    float dt = abs(t1*t2/(2.0*t2-t1)-c0);

    vec3 ce = getPos(p,c0);

    vec3 dpdx = (dl<dr) ?  ce-getPos(p-ivec2(1,0),l1) :
                          -ce+getPos(p+ivec2(1,0),r1) ;
    vec3 dpdy = (db<dt) ?  ce-getPos(p-ivec2(0,1),b1) :
                          -ce+getPos(p+ivec2(0,1),t1) ;

    return normalize(cross(dpdx,dpdy));
}

`;
