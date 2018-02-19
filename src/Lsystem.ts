import {vec2, vec3, vec4, mat4} from 'gl-matrix';
import Stack from './collection';

class Lsystem{
    
    axiom: string;
    num: number;
    initator: string;
    length: number;
    angle: number;
    result: string;
    branches: vec3[];
    ruleleft: string[];
    ruleright: string[];

//https://gist.github.com/bbengfort/11183420

    constructor(ruleleft: string[], ruleright: string[], num: number = 3, initator: string = 'F', length: number = 1, angle: number = 25 / 180 * Math.PI)
    {
        //this.axiom = axiom;
        this.ruleleft = ruleleft;
        this.ruleright = ruleright;
        this.num = num;
        this.initator = initator;
        this.length = length;
        this.angle = angle;
        this.branches = new Array<vec3>();
    }

    iterate(){
        var result = this.initator;
        for(var i = 0; i < this.num; i++)
        {
            result = this.translate(result);
        }
        this.result = result;
        //console.log(result);
    }

    translate(current: string){
        //Translate all the "F" with the axiom for current string
        var result = "";
        // var rule1 = "FF-[-F+F]+[+F-F]";
        // var rule2 = "FF+[+F]+[-F]";
        for(var i = 0; i < current.length; i++)
        {
            let fitrule = false;
            for(var j = 0; j < this.ruleleft.length; j++)
            {  
                if(current[i]==this.ruleleft[j])
                {
                    result += this.ruleright[j];
                    fitrule = true;
                    break;
                }
            }
            if(!fitrule)
            {
                result += current[i];
                continue;
            }
        }
        return result;
    }

    process()
    {
        var turtle = new Turtle();
        var stack = new Stack();
        var result = this.result;
        for(var i = 0; i < result.length; i++)
        {
            if(result[i]=="F")
            {
                this.branches.push(turtle.pos);
                turtle.moveForward(this.length);
                this.branches.push(turtle.pos);
            }
            else if(result[i]=="f")
            {
                turtle.moveForward(this.length);
            }
            else if (result[i] == "+")
            {
                turtle.applyUpRot(this.angle);
            }
            else if (result[i] == "-")
            {
                turtle.applyUpRot(-this.angle);
            }
            else if (result[i] == "&")
            {
                turtle.applyLeftRot(this.angle);
            }
            else if (result[i] == "^")
            {
                turtle.applyLeftRot(-this.angle);
            }
            else if (result[i] == "\\")
            {
                turtle.applyForwardRot(this.angle);
            }
            else if (result[i] == "/")
            {
                turtle.applyForwardRot(-this.angle);
            }
            else if (result[i] == "|")
            {
                turtle.applyUpRot(Math.PI);
            }
            else if (result[i] == "[")
            {
                //  console.log('push');
                //  console.log("turtle.pos" + turtle.pos);
                 var temp = new Turtle();
                 temp.copy(turtle);
                 stack.push(temp);
                //  console.log('pushend');
                //  console.log("stack.peek.pos" + stack.peek().pos);
            }
            else if (result[i] == "]")
            {
                //  console.log("stack.peek.pos" + stack.pop().pos);
                //  console.log('popstart');
                //  console.log("turtle.pos" + turtle.pos);
                 turtle.copy(stack.pop());
                //  console.log('pop');
                //  console.log('popend');
            }
        }
    }
};

class Turtle{
    
    pos: vec3 = vec3.create();
    up: vec3 = vec3.create();
    forward: vec3 = vec3.create();
    left: vec3 = vec3.create();

    constructor(pos: vec3 = vec3.fromValues(0, 0, 0), up: vec3 = vec3.fromValues(0, 0, 1), forward: vec3 = vec3.fromValues(1, 0, 0), left: vec3 = vec3.fromValues(0, 1, 0))
    {
        this.pos = pos;
        this.up = up;
        this.forward = forward;
        this.left = left;
    }

    copy(turtle: Turtle)
    {
        this.pos = turtle.pos;
        this.up = turtle.up;
        this.forward = turtle.forward;
        this.left = turtle.left;
    }

    fromRotationMatrix()
    {
        return mat4.fromValues(this.forward[0], this.forward[1], this.forward[2], 0, 
            this.left[0], this.left[1], this.left[2], 0, 
            this.up[0], this.up[1],this.up[2],0,
            0,0,0,1);
    }

    moveForward(distance: number){
        this.pos = vec3.fromValues(this.pos[0] + distance * this.forward[0], this.pos[1] + distance * this.forward[1], this.pos[2] + distance * this.forward[2]);
    }
    applyUpRot(degrees: number){
        var mat = mat4.create();
        mat4.fromZRotation(mat, degrees);
        mat4.multiply(mat, this.fromRotationMatrix(), mat);
        var temp = vec4.create();
        vec4.transformMat4(temp, vec4.fromValues(0, 0, 1, 1), mat);
        this.up = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(0, 1, 0, 1), mat);
        this.left = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(1, 0, 0, 1), mat);
        this.forward = vec3.fromValues(temp[0], temp[1], temp[2]);
    }

    applyLeftRot(degrees: number){
        var mat = mat4.create();
        mat4.fromYRotation(mat, degrees);
        mat4.multiply(mat, this.fromRotationMatrix(), mat);
        var temp = vec4.create();
        vec4.transformMat4(temp, vec4.fromValues(0, 0, 1, 1), mat);
        this.up = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(0, 1, 0, 1), mat);
        this.left = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(1, 0, 0, 1), mat);
        this.forward = vec3.fromValues(temp[0], temp[1], temp[2]);
    }

    applyForwardRot(degrees: number){
        var mat = mat4.create();
        mat4.fromXRotation(mat, degrees);
        mat4.multiply(mat, this.fromRotationMatrix(), mat);
        var temp = vec4.create();
        vec4.transformMat4(temp, vec4.fromValues(0, 0, 1, 1), mat);
        this.up = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(0, 1, 0, 1), mat);
        this.left = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(1, 0, 0, 1), mat);
        this.forward = vec3.fromValues(temp[0], temp[1], temp[2]);
    }
};

export default Lsystem;